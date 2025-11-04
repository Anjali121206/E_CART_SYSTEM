#include <iostream>
#include <string>
#include <sstream>
#include <memory>
#include <map>
#ifdef __has_include
#  if __has_include(<filesystem>)
#    include <filesystem>
namespace fs = std::filesystem;
#  elif __has_include(<experimental/filesystem>)
#    include <experimental/filesystem>
namespace fs = std::experimental::filesystem;
#  elif __has_include(<boost/filesystem.hpp>)
#    include <boost/filesystem.hpp>
namespace fs = boost::filesystem;
#  else
#    include <sys/stat.h>
#    include <sys/types.h>
#    ifdef _WIN32
#      include <direct.h>
#    endif
namespace fs {
inline bool create_directories(const std::string& path) {
    if (path.empty()) return false;
    std::string cur;
    for (size_t i = 0; i < path.size(); ++i) {
        cur.push_back(path[i]);
        if (path[i] == '/' || path[i] == '\\' || i + 1 == path.size()) {
            std::string comp = cur;
            if (!comp.empty() && (comp.back() == '/' || comp.back() == '\\')) comp.pop_back();
#ifdef _WIN32
            _mkdir(comp.c_str());
#else
            mkdir(comp.c_str(), 0755);
#endif
        }
    }
    return true;
}
} // namespace fs
#  endif
#else
#  include <filesystem>
namespace fs = std::filesystem;
#endif
#include <fstream>
#include "third_party/httplib.h"
#include "infra/config.h"
#include "infra/user_repository.h"
#include "infra/product_repository.h"
#include "infra/order_repository.h"
#include "core/inventory.h"
#include "core/cart.h"
#include "core/payment.h"
#include "utils/crypto.h"
#include "utils/time.h"
#include "infra/file_store.h"
#include "core/price_policy.h"
#include "core/tracker.h"
#include "core/rider_simulator.h"
#include "core/invoice_builder.h"
#include "core/services/product_service.h"
#include "core/services/user_service.h"
#include "core/services/order_service.h"
#include "core/services/review_service.h"
#include "core/services/wishlist_service.h"
#include "core/offer.h"
#include "core/delivery.h"

static std::string jsonEscape(const std::string& s){
    std::ostringstream o; for (char c: s){ if (c=='"' || c=='\\' ) o<<'\\'<<c; else if (c=='\n') o<<"\\n"; else o<<c; } return o.str();
}

static std::string urlDecode(const std::string& s){
    std::string out; out.reserve(s.size());
    for (size_t i=0;i<s.size();++i){
        if (s[i]=='%' && i+2<s.size()){
            auto hex = s.substr(i+1,2);
            char ch = static_cast<char>(std::strtol(hex.c_str(), nullptr, 16));
            out.push_back(ch); i+=2;
        } else if (s[i]=='+') { out.push_back(' '); }
        else { out.push_back(s[i]); }
    }
    return out;
}

int main(){
    Config cfg;
    // Resolve data folder robustly regardless of working directory
    std::string data_path;
    const char* candidates[] = { "./data/", "../data/", "../../data/", "../../../data/" };
    for (const char* cand : candidates) {
        std::ifstream f(std::string(cand) + "products.txt");
        if (f.good()) { data_path = cand; break; }
    }
    if (data_path.empty()) {
        data_path = "../../data/"; // fallback
    }
    cfg.get().users = data_path + "users.txt";
    cfg.get().products = data_path + "products.txt";
    cfg.get().orders = data_path + "orders.txt";
    cfg.get().sales = data_path + "sales.txt";
    cfg.get().config = data_path + "config.json";
    cfg.loadDefaultPaths();

    UserRepository userRepo(cfg.get().users);
    ProductRepository productRepo(cfg.get().products);
    OrderRepository orderRepo(cfg.get().orders);
    Inventory inv; 
    auto products = productRepo.getAll();
    inv.getProducts() = std::move(products);
    ProductService productService(inv, productRepo);
    UserService userService(userRepo);
    OrderService orderService(orderRepo, inv, productRepo);
    ReviewService reviewService;
    WishlistService wishlistService;
    // Map orderId -> tracker + rider simulator
    std::map<std::string, std::pair<OrderTracker, TextPathStrategy>> trackers;
    // Delivery management
    std::map<std::string, Delivery> deliveries;
    // Offers
    std::vector<std::unique_ptr<Offer>> offers;
    offers.push_back(std::make_unique<CouponOffer>(20.0, "SAVE20"));
    offers.push_back(std::make_unique<ThresholdOffer>(500.0, 50.0, "Rs. 50 off on orders above Rs. 500"));
    offers.push_back(std::make_unique<BOGOOffer>(1, 1, "Snacks"));

    httplib::Server svr;
    svr.set_default_headers({{"Access-Control-Allow-Origin","*"}, {"Access-Control-Allow-Headers","*"}, {"Access-Control-Allow-Methods","*"}});
    svr.Options("/.*", [](const httplib::Request&, httplib::Response& res){ res.status=200; });

        svr.Get("/api/products", [&](const httplib::Request& req, httplib::Response& res){
            std::string search = req.get_param_value("search");
            std::string category = req.get_param_value("category");
            std::string minPriceStr = req.get_param_value("minPrice");
            std::string maxPriceStr = req.get_param_value("maxPrice");

            double minPrice = minPriceStr.empty() ? -1 : std::stod(minPriceStr);
            double maxPrice = maxPriceStr.empty() ? -1 : std::stod(maxPriceStr);

            std::vector<Product*> products;
            if (!search.empty() || !category.empty() || minPrice >= 0 || maxPrice >= 0) {
                auto filtered = productRepo.combinedSearch(search, category, minPrice, maxPrice);
                for (auto& p : filtered) {
                    products.push_back(p.get());
                }
            } else {
                products = productService.getAllProducts();
            }

            std::ostringstream out; out << '['; bool first=true;
            for (const auto& p : products){
                if (!first) out << ','; first=false;
                out << "{\"id\":" << p->getId() << ",\"name\":\"" << jsonEscape(p->getName()) << "\",\"price\":" << p->getBasePrice() << ",\"stock\":" << p->getStock() << ",\"type\":\"" << jsonEscape(p->getType()) << "\"}";
            }
            out << ']';
            res.set_content(out.str(), "application/json");
        });

    // ADMIN: Add product
    svr.Post("/api/admin/products", [&](const httplib::Request& req, httplib::Response& res){
        std::string type = req.get_param_value("type");
        std::string name = req.get_param_value("name");
        std::string sprice = req.get_param_value("price");
        std::string sstock = req.get_param_value("stock");
        if (type.empty() || name.empty() || sprice.empty() || sstock.empty()) {
            res.status = 400; res.set_content("{\"error\":\"Missing fields\"}", "application/json"); return;
        }
        double price = std::stod(sprice); int stock = std::stoi(sstock);
        productService.addProduct(type, name, price, stock);
        res.set_content("{\"success\":true}", "application/json");
    });

    // ADMIN: Update product stock
    svr.Put("/api/admin/products/:id", [&](const httplib::Request& req, httplib::Response& res){
        int id = std::stoi(req.matches[1]);
        std::string sstock = req.get_param_value("stock");
        if (sstock.empty()) { res.status=400; res.set_content("{\"error\":\"stock required\"}", "application/json"); return; }
        int stock = std::stoi(sstock);
        bool ok = productService.updateProduct(id, "", "", 0.0, stock);
        if (!ok) { res.status=404; res.set_content("{\"error\":\"Product not found\"}", "application/json"); return; }
        res.set_content("{\"success\":true}", "application/json");
    });

    // ADMIN: Delete product
    svr.Delete("/api/admin/products/:id", [&](const httplib::Request& req, httplib::Response& res){
        int id = std::stoi(req.matches[1]);
        bool ok = productService.deleteProduct(id);
        if (!ok) { res.status=404; res.set_content("{\"error\":\"Product not found\"}", "application/json"); return; }
        res.set_content("{\"success\":true}", "application/json");
    });

    // GET /api/products/:id - Get product by ID
    svr.Get("/api/products/:id", [&](const httplib::Request& req, httplib::Response& res){
        std::string idStr = req.matches[1];
        int id = std::stoi(idStr);
        auto* product = inv.findById(id);
        if (!product) {
            res.status = 404;
            res.set_content("{\"error\":\"Product not found\"}", "application/json");
            return;
        }
        std::ostringstream out;
        out << "{\"id\":" << product->getId() << ",\"name\":\"" << jsonEscape(product->getName()) 
            << "\",\"price\":" << product->getBasePrice() << ",\"stock\":" << product->getStock() 
            << ",\"type\":\"" << jsonEscape(product->getType()) << "\"}";
        res.set_content(out.str(), "application/json");
    });

    // POST /api/login - User login
    svr.Post("/api/login", [&](const httplib::Request& req, httplib::Response& res){
        std::string email;
        if (req.has_header("Content-Type") && req.get_header_value("Content-Type").find("application/x-www-form-urlencoded") != std::string::npos) {
            auto body = req.body;
            size_t pos = body.find("email=");
            if (pos != std::string::npos) {
                email = body.substr(pos + 6);
                size_t end = email.find('&');
                if (end != std::string::npos) email = email.substr(0, end);
            }
        } else {
            email = req.get_param_value("email");
        }
        auto users = userRepo.getAll();
        for (const auto& u : users) {
            if (u.getEmail() == email) {
                res.set_content("{\"success\":true,\"email\":\"" + jsonEscape(email) + "\"}", "application/json");
                return;
            }
        }
        res.status = 401;
        res.set_content("{\"error\":\"User not found\"}", "application/json");
    });

    // POST /api/register - User registration
    svr.Post("/api/register", [&](const httplib::Request& req, httplib::Response& res){
        std::string email, username;
        if (req.has_header("Content-Type") && req.get_header_value("Content-Type").find("application/x-www-form-urlencoded") != std::string::npos) {
            auto body = req.body;
            size_t emailPos = body.find("email=");
            size_t userPos = body.find("username=");
            if (emailPos != std::string::npos) {
                email = body.substr(emailPos + 6);
                size_t end = email.find('&');
                if (end != std::string::npos) email = email.substr(0, end);
            }
            if (userPos != std::string::npos) {
                username = body.substr(userPos + 9);
                size_t end = username.find('&');
                if (end != std::string::npos) username = username.substr(0, end);
            }
        } else {
            email = req.get_param_value("email");
            username = req.get_param_value("username");
        }
        if (email.empty()) {
            res.status = 400;
            res.set_content("{\"error\":\"Email required\"}", "application/json");
            return;
        }
        if (username.empty()) username = email;
        auto users = userRepo.getAll();
        for (const auto& u : users) {
            if (u.getEmail() == email) {
                res.status = 400;
                res.set_content("{\"error\":\"User already exists\"}", "application/json");
                return;
            }
        }
        User newUser(username, email, Crypto::hash(""), "USER");
        auto allUsers = userRepo.getAll();
        allUsers.push_back(newUser);
        userRepo.saveAll(allUsers);
        res.set_content("{\"success\":true,\"email\":\"" + jsonEscape(email) + "\"}", "application/json");
    });

    // POST /api/checkout - Create order
    svr.Post("/api/checkout", [&](const httplib::Request& req, httplib::Response& res){
        try {
            std::string userEmail, paymentMode = "UPI", coupon = "";
            std::vector<CartItem> cartItems;
            
            // Parse JSON body - simplified JSON parsing
            size_t emailPos = req.body.find("\"userEmail\"");
            size_t paymentPos = req.body.find("\"paymentMode\"");
            size_t couponPos = req.body.find("\"coupon\"");
            size_t itemsPos = req.body.find("\"items\":[");
            
            if (emailPos != std::string::npos) {
                size_t start = req.body.find('"', emailPos + 10) + 1;
                size_t end = req.body.find('"', start);
                userEmail = req.body.substr(start, end - start);
            }
            
            if (paymentPos != std::string::npos) {
                size_t start = req.body.find('"', paymentPos + 12) + 1;
                size_t end = req.body.find('"', start);
                paymentMode = req.body.substr(start, end - start);
            }
            
            if (couponPos != std::string::npos) {
                size_t start = req.body.find('"', couponPos + 8) + 1;
                size_t end = req.body.find('"', start);
                coupon = req.body.substr(start, end - start);
            }
            
            if (itemsPos != std::string::npos) {
                size_t arrayStart = itemsPos + 8;
                size_t arrayEnd = req.body.find("]", arrayStart);
                std::string itemsStr = req.body.substr(arrayStart, arrayEnd - arrayStart);
                
                size_t pos = 0;
                while ((pos = itemsStr.find("productId", pos)) != std::string::npos) {
                    size_t idStart = itemsStr.find(':', pos) + 1;
                    while (itemsStr[idStart] == ' ') idStart++;
                    size_t idEnd = idStart;
                    while (idEnd < itemsStr.length() && itemsStr[idEnd] != ',' && itemsStr[idEnd] != '}') idEnd++;
                    int pid = std::stoi(itemsStr.substr(idStart, idEnd - idStart));
                    
                    size_t qtyPos = itemsStr.find("quantity", pos);
                    if (qtyPos != std::string::npos) {
                        size_t qtyStart = itemsStr.find(':', qtyPos) + 1;
                        while (qtyStart < itemsStr.length() && itemsStr[qtyStart] == ' ') qtyStart++;
                        size_t qtyEnd = qtyStart;
                        while (qtyEnd < itemsStr.length() && itemsStr[qtyEnd] != ',' && itemsStr[qtyEnd] != '}') qtyEnd++;
                        int qty = std::stoi(itemsStr.substr(qtyStart, qtyEnd - qtyStart));
                        
                        auto* p = inv.findById(pid);
                        if (p) {
                            cartItems.push_back({pid, qty, p->getBasePrice()});
                        }
                    }
                    pos = itemsStr.find('}', pos) + 1;
                }
            }

            if (cartItems.empty()) {
                res.status = 400;
                res.set_content("{\"error\":\"Empty cart\"}", "application/json");
                return;
            }

            Cart cart;
            for (const auto& item : cartItems) {
                cart.addItem(item.productId, item.quantity, item.unitPrice);
            }

            Order order = orderService.createOrder(userEmail, cart, paymentMode, coupon);
            
            // Initialize tracker for this order
            trackers[order.id] = std::make_pair(OrderTracker(), TextPathStrategy());

            std::ostringstream out;
            out << "{\"orderId\":\"" << jsonEscape(order.id) << "\",\"total\":" << order.total << "}";
            res.set_content(out.str(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content("{\"error\":\"" + jsonEscape(e.what()) + "\"}", "application/json");
        }
    });

    // GET /api/orders - Get orders by user email
    svr.Get("/api/orders", [&](const httplib::Request& req, httplib::Response& res){
        std::string email = req.get_param_value("email");
        if (email.empty()) {
            res.status = 400;
            res.set_content("{\"error\":\"Email parameter required\"}", "application/json");
            return;
        }
        auto orders = orderService.getOrdersByUser(email);
        std::ostringstream out;
        out << '[';
        bool first = true;
        for (const auto& o : orders) {
            if (!first) out << ',';
            first = false;
            std::string status = "Placed";
            if (trackers.find(o.id) != trackers.end()) {
                status = trackers[o.id].first.current();
            }
            out << "{\"id\":\"" << jsonEscape(o.id) << "\",\"timestamp\":\"" << jsonEscape(o.timestamp) 
                << "\",\"total\":" << o.total << ",\"status\":\"" << jsonEscape(status) << "\"}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    // GET /api/order/:id/status - Get order status
    svr.Get("/api/order/:id/status", [&](const httplib::Request& req, httplib::Response& res){
        // Parse orderId from path manually to handle hyphens
        std::string path = req.path;
        size_t start = path.find("/api/order/") + 11;
        size_t end = path.find("/", start);
        if (end == std::string::npos) end = path.size();
        std::string orderId = path.substr(start, end - start);
        orderId = urlDecode(orderId);
        std::string status = "Placed";
        if (trackers.find(orderId) != trackers.end()) {
            status = trackers[orderId].first.current();
        }
        std::ostringstream out;
        out << "{\"status\":\"" << jsonEscape(status) << "\"}";
        res.set_content(out.str(), "application/json");
    });

    // GET /api/order/:id/track - Get rider waypoint
    svr.Get("/api/order/:id/track", [&](const httplib::Request& req, httplib::Response& res){
        // Parse orderId from path manually to handle hyphens
        std::string path = req.path;
        size_t start = path.find("/api/order/") + 11;
        size_t end = path.find("/", start);
        if (end == std::string::npos) end = path.size();
        std::string orderId = path.substr(start, end - start);
        orderId = urlDecode(orderId);
        std::string waypoint = "";
        if (trackers.find(orderId) != trackers.end()) {
            auto& tracker = trackers[orderId];
            // Advance tracker periodically (simulate)
            static std::map<std::string, int> callCounts;
            callCounts[orderId]++;
            if (callCounts[orderId] % 3 == 0 && tracker.first.advance()) {
                // Status advanced
            }
            waypoint = tracker.second.nextLocation();
        } else {
            waypoint = "Unknown";
        }
        std::ostringstream out;
        out << "{\"waypoint\":\"" << jsonEscape(waypoint) << "\"}";
        res.set_content(out.str(), "application/json");
    });

    // GET /api/order/:id/invoice - Get invoice
    svr.Get("/api/order/:id/invoice", [&](const httplib::Request& req, httplib::Response& res){
        // Parse orderId from path manually to handle hyphens
        std::string path = req.path;
        size_t start = path.find("/api/order/") + 11;
        size_t end = path.find("/", start);
        if (end == std::string::npos) end = path.size();
        std::string orderId = path.substr(start, end - start);
        orderId = urlDecode(orderId);
        std::cout << "Received invoice request for orderId: [" << orderId << "]" << std::endl;
        auto orders = orderService.getAllOrders(); // Use orderService to get all orders
        Order* foundOrder = nullptr;
        for (auto& o : orders) {
            std::cout << "Comparing with order in repo: [" << o.id << "]" << std::endl;
            if (o.id == orderId) {
                foundOrder = &o;
                break;
            }
        }
        if (!foundOrder) {
            res.status = 404;
            res.set_content("Order not found", "text/plain");
            return;
        }
        InvoiceBuilder builder(*foundOrder, inv);
        builder.buildHeader().buildLines().buildFooter();
        res.set_content(builder.str(), "text/plain");
    });

    // GET /api/offers - Get available offers
    svr.Get("/api/offers", [&](const httplib::Request& req, httplib::Response& res){
        std::ostringstream out;
        out << '[';
        bool first = true;
        for (const auto& offer : offers) {
            if (!first) out << ',';
            first = false;
            out << "{\"type\":\"" << jsonEscape(offer->getType()) << "\",\"description\":\"" << jsonEscape(offer->getDescription()) << "\"}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    // POST /api/delivery/book - Book delivery slot
    svr.Post("/api/delivery/book", [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId = req.get_param_value("orderId");
        std::string slot = req.get_param_value("slot");
        if (orderId.empty() || slot.empty()) {
            res.status = 400;
            res.set_content("{\"error\":\"orderId and slot required\"}", "application/json");
            return;
        }
        deliveries[orderId] = Delivery();
        if (deliveries[orderId].selectSlot(slot)) {
            res.set_content("{\"success\":true}", "application/json");
        } else {
            res.status = 400;
            res.set_content("{\"error\":\"Invalid slot\"}", "application/json");
        }
    });

    // GET /api/delivery/:orderId/status - Get delivery status
    svr.Get("/api/delivery/:orderId/status", [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId = req.matches[1];
        if (deliveries.find(orderId) == deliveries.end()) {
            res.status = 404;
            res.set_content("{\"error\":\"Delivery not found\"}", "application/json");
            return;
        }
        auto& delivery = deliveries[orderId];
        std::ostringstream out;
        out << "{\"status\":\"" << jsonEscape(delivery.getStatus()) << "\",\"slot\":\"" << jsonEscape(delivery.getSelectedSlot()) << "\",\"estimate\":" << delivery.getEstimatedMinutes() << "}";
        res.set_content(out.str(), "application/json");
    });

    // Start the server
    std::cout << "Starting server on http://0.0.0.0:8080" << std::endl;
    if (!svr.listen("0.0.0.0", 8080)) {
        std::cerr << "Failed to start server" << std::endl;
        return 1;
    }
    return 0;
}