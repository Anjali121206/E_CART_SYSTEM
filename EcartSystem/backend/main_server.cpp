#include <iostream>
#include <string>
#include <sstream>
#include <memory>
#include <map>
#include <vector>
#include <algorithm>
#include <chrono>
#include <iomanip>
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
    std::ostringstream o; 
    for (char c: s){ 
        if (c=='"' || c=='\\' ) o<<'\\'<<c; 
        else if (c=='\n') o<<"\\n"; 
        else if (c=='\r') o<<"\\r";
        else if (c=='\t') o<<"\\t";
        else o<<c; 
    } 
    return o.str();
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

static std::string extractJsonField(const std::string& json, const std::string& field) {
    std::string target = "\"" + field + "\"";
    size_t pos = json.find(target);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos + target.length());
    if (pos == std::string::npos) return "";
    
    // Skip whitespace
    while (pos + 1 < json.length() && (json[pos+1] == ' ' || json[pos+1] == '\t' || json[pos+1] == '\r' || json[pos+1] == '\n')) pos++;
    
    if (pos + 1 < json.length() && json[pos+1] == '"') {
        size_t start = pos + 2;
        size_t end = json.find('"', start);
        if (end == std::string::npos) return "";
        return json.substr(start, end - start);
    } else {
        size_t start = pos + 1;
        size_t end = start;
        while (end < json.length() && json[end] != ',' && json[end] != '}' && json[end] != ']' && json[end] != ' ' && json[end] != '\r' && json[end] != '\n') {
            end++;
        }
        return json.substr(start, end - start);
    }
}

struct InMemoryReview {
    int productId;
    std::string author;
    int rating;
    std::string text;
    std::string date;
};

int main(){
    Config cfg;
    std::string data_path;
    const char* candidates[] = { "./data/", "../data/", "../../data/", "../../../data/" };
    for (const char* cand : candidates) {
        std::ifstream f(std::string(cand) + "products.txt");
        if (f.good()) { data_path = cand; break; }
    }
    if (data_path.empty()) {
        data_path = "../../data/";
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

    // Map orderId -> tracker + rider simulator
    std::map<std::string, std::pair<OrderTracker, TextPathStrategy>> trackers;
    // Delivery management
    std::map<std::string, Delivery> deliveries;
    // In-memory reviews store
    std::vector<InMemoryReview> reviewsStore = {
        {1001, "Rahul Sharma", 5, "Amazing smart watch! Battery easily lasts 5 days.", "2024-02-10"},
        {1001, "Sneha Patel", 4, "Great fitness tracking and stylish design.", "2024-02-14"},
        {1002, "Amit Verma", 5, "Super soft cotton material and perfect fit!", "2024-02-01"},
        {1004, "Priya Nair", 5, "Crisp audio, deep bass, and instant Bluetooth pairing.", "2024-01-28"},
        {1005, "Vikas Gupta", 4, "Comfortable stretch denim, highly recommended.", "2024-02-05"},
        {1006, "Pooja Das", 5, "Authentic extra virgin olive oil, great flavor!", "2024-02-12"}
    };

    httplib::Server svr;
    svr.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept"},
        {"Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH"}
    });

    svr.Options(".*", [](const httplib::Request&, httplib::Response& res){ 
        res.status = 200; 
    });

    // ==========================================
    // PRODUCTS API
    // ==========================================

    auto getProductCategory = [](const std::string& type, const std::string& name) -> std::string {
        if (!type.empty()) return type;
        if (name.find("Watch") != std::string::npos || name.find("Earbuds") != std::string::npos) return "Electronics";
        if (name.find("Shirt") != std::string::npos || name.find("Jeans") != std::string::npos || name.find("cargoes") != std::string::npos || name.find("pants") != std::string::npos) return "Clothing";
        return "Grocery";
    };

    auto getProductImage = [](int id, const std::string& name) -> std::string {
        switch(id) {
            case 1001: return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";
            case 1002: return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80";
            case 1003: return "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80";
            case 1004: return "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80";
            case 1005: return "https://images.unsplash.com/photo-1542272604-780c96856592?w=500&auto=format&fit=crop&q=80";
            case 1006: return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80";
            case 1007: return "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80";
            case 1008: return "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80";
            case 1009: return "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500&auto=format&fit=crop&q=80";
            default: return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80";
        }
    };

    auto getProductRating = [](int id) -> double {
        switch(id) {
            case 1001: return 4.8;
            case 1002: return 4.5;
            case 1003: return 4.7;
            case 1004: return 4.9;
            case 1005: return 4.3;
            case 1006: return 4.6;
            case 1007: return 4.2;
            case 1008: return 4.4;
            case 1009: return 4.1;
            default: return 4.5;
        }
    };

    auto getProductReviewsCount = [](int id) -> int {
        switch(id) {
            case 1001: return 128;
            case 1002: return 84;
            case 1003: return 210;
            case 1004: return 315;
            case 1005: return 92;
            case 1006: return 76;
            case 1007: return 45;
            case 1008: return 38;
            case 1009: return 29;
            default: return 50;
        }
    };

    auto getProductDescription = [](int id, const std::string& name, const std::string& cat) -> std::string {
        if (id == 1001) return "Premium smartwatch featuring real-time heart rate monitoring, SPO2 sensor, GPS tracking, and a bright AMOLED always-on display with 7-day battery life.";
        if (id == 1002) return "100% breathable organic cotton classic crewneck t-shirt. Tailored modern fit suitable for everyday casual wear.";
        if (id == 1003) return "Aromatic royal long-grain aged Basmati Rice. Perfect for biryani, pulao, and festive delicacies.";
        if (id == 1004) return "True wireless stereo earbuds with active noise cancellation, environmental sound mode, touch controls, and 30-hour total playback with charging case.";
        if (id == 1005) return "Classic slim-tapered stretch denim jeans crafted with durable stitching and wash treatments for unmatched style and all-day comfort.";
        if (id == 1006) return "100% cold-pressed extra virgin olive oil imported from Mediterranean groves. Rich in antioxidants and healthy monounsaturated fats.";
        if (id == 1007) return "Fresh, crisp and handpicked Himalayan red apples loaded with dietary fiber and natural vitamins.";
        if (id == 1008) return "Durable multi-pocket tactical cargo trousers made with reinforced ripstop cotton for outdoor adventures and urban utility.";
        if (id == 1009) return "Lightweight relaxed-fit daily utility pants with elasticated waistband and modern silhouette.";
        return "High quality " + name + " in the " + cat + " collection. Guaranteed authentic and backed by our easy 7-day return policy.";
    };

    svr.Get("/api/products", [&](const httplib::Request& req, httplib::Response& res){
        std::string search = req.get_param_value("search");
        std::string category = req.get_param_value("category");
        std::string minPriceStr = req.get_param_value("minPrice");
        std::string maxPriceStr = req.get_param_value("maxPrice");

        double minPrice = minPriceStr.empty() ? -1 : std::stod(minPriceStr);
        double maxPrice = maxPriceStr.empty() ? -1 : std::stod(maxPriceStr);

        std::vector<Product*> productsList;
        if (!search.empty() || !category.empty() || minPrice >= 0 || maxPrice >= 0) {
            auto filtered = productRepo.combinedSearch(search, category, minPrice, maxPrice);
            for (auto& p : filtered) {
                productsList.push_back(p.get());
            }
        } else {
            productsList = productService.getAllProducts();
        }

        std::ostringstream out; out << '['; bool first = true;
        for (const auto& p : productsList){
            if (!first) out << ','; first = false;
            std::string cat = getProductCategory(p->getType(), p->getName());
            int stock = p->getStock() > 0 ? p->getStock() : 15;
            out << "{"
                << "\"id\":" << p->getId() << ","
                << "\"name\":\"" << jsonEscape(p->getName()) << "\","
                << "\"price\":" << p->getBasePrice() << ","
                << "\"stock\":" << stock << ","
                << "\"category\":\"" << jsonEscape(cat) << "\","
                << "\"type\":\"" << jsonEscape(p->getType()) << "\","
                << "\"rating\":" << getProductRating(p->getId()) << ","
                << "\"reviews\":" << getProductReviewsCount(p->getId()) << ","
                << "\"image\":\"" << jsonEscape(getProductImage(p->getId(), p->getName())) << "\","
                << "\"description\":\"" << jsonEscape(getProductDescription(p->getId(), p->getName(), cat)) << "\""
                << "}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    svr.Get(R"(/api/products/(\d+))", [&](const httplib::Request& req, httplib::Response& res){
        std::string idStr = req.matches[1];
        int id = std::stoi(idStr);
        auto* product = inv.findById(id);
        if (!product) {
            res.status = 404;
            res.set_content("{\"error\":\"Product not found\"}", "application/json");
            return;
        }
        std::string cat = getProductCategory(product->getType(), product->getName());
        int stock = product->getStock() > 0 ? product->getStock() : 15;
        std::ostringstream out;
        out << "{"
            << "\"id\":" << product->getId() << ","
            << "\"name\":\"" << jsonEscape(product->getName()) << "\","
            << "\"price\":" << product->getBasePrice() << ","
            << "\"stock\":" << stock << ","
            << "\"category\":\"" << jsonEscape(cat) << "\","
            << "\"type\":\"" << jsonEscape(product->getType()) << "\","
            << "\"rating\":" << getProductRating(product->getId()) << ","
            << "\"reviews\":" << getProductReviewsCount(product->getId()) << ","
            << "\"image\":\"" << jsonEscape(getProductImage(product->getId(), product->getName())) << "\","
            << "\"description\":\"" << jsonEscape(getProductDescription(product->getId(), product->getName(), cat)) << "\""
            << "}";
        res.set_content(out.str(), "application/json");
    });

    // ==========================================
    // REVIEWS API
    // ==========================================

    svr.Get(R"(/api/reviews/(\d+))", [&](const httplib::Request& req, httplib::Response& res){
        int pid = std::stoi(req.matches[1]);
        std::ostringstream out; out << '['; bool first = true;
        for (const auto& r : reviewsStore) {
            if (r.productId == pid) {
                if (!first) out << ','; first = false;
                out << "{"
                    << "\"author\":\"" << jsonEscape(r.author) << "\","
                    << "\"rating\":" << r.rating << ","
                    << "\"text\":\"" << jsonEscape(r.text) << "\","
                    << "\"date\":\"" << jsonEscape(r.date) << "\""
                    << "}";
            }
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    svr.Post(R"(/api/reviews/(\d+))", [&](const httplib::Request& req, httplib::Response& res){
        int pid = std::stoi(req.matches[1]);
        std::string author = extractJsonField(req.body, "author");
        std::string ratingStr = extractJsonField(req.body, "rating");
        std::string text = extractJsonField(req.body, "text");
        if (author.empty()) author = "Verified Customer";
        int rating = ratingStr.empty() ? 5 : std::stoi(ratingStr);
        
        auto now = std::chrono::system_clock::now();
        std::time_t t = std::chrono::system_clock::to_time_t(now);
        std::stringstream ss; ss << std::put_time(std::localtime(&t), "%Y-%m-%d");
        
        reviewsStore.push_back({pid, author, rating, text, ss.str()});
        res.set_content("{\"success\":true,\"message\":\"Review added successfully\"}", "application/json");
    });

    // ==========================================
    // AUTH & USER APIS
    // ==========================================

    auto handleLogin = [&](const httplib::Request& req, httplib::Response& res){
        std::string email = extractJsonField(req.body, "email");
        if (email.empty()) {
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
        }
        email = urlDecode(email);

        auto users = userRepo.getAll();
        for (const auto& u : users) {
            if (u.getEmail() == email) {
                std::string role = u.getRole().empty() ? "USER" : u.getRole();
                std::string name = u.getUsername().empty() ? "Customer" : u.getUsername();
                std::string token = "jwt_" + Crypto::hash(email) + "_" + std::to_string(std::time(nullptr));
                
                std::ostringstream out;
                out << "{"
                    << "\"success\":true,"
                    << "\"token\":\"" << jsonEscape(token) << "\","
                    << "\"user\":{"
                    << "\"id\":1,"
                    << "\"email\":\"" << jsonEscape(email) << "\","
                    << "\"name\":\"" << jsonEscape(name) << "\","
                    << "\"role\":\"" << jsonEscape(role) << "\","
                    << "\"phone\":\"+91 9876543210\","
                    << "\"address\":\"221B Baker Street, New Delhi, India\""
                    << "}"
                    << "}";
                res.set_content(out.str(), "application/json");
                return;
            }
        }

        // Allow demo login with any email if not found
        if (!email.empty()) {
            std::string username = email.substr(0, email.find('@'));
            User newUser(username, email, Crypto::hash(""), "USER");
            users.push_back(newUser);
            userRepo.saveAll(users);
            
            std::string token = "jwt_" + Crypto::hash(email) + "_" + std::to_string(std::time(nullptr));
            std::ostringstream out;
            out << "{"
                << "\"success\":true,"
                << "\"token\":\"" << jsonEscape(token) << "\","
                << "\"user\":{"
                << "\"id\":" << users.size() << ","
                << "\"email\":\"" << jsonEscape(email) << "\","
                << "\"name\":\"" << jsonEscape(username) << "\","
                << "\"role\":\"USER\","
                << "\"phone\":\"+91 9876543210\","
                << "\"address\":\"221B Baker Street, New Delhi, India\""
                << "}"
                << "}";
            res.set_content(out.str(), "application/json");
            return;
        }

        res.status = 401;
        res.set_content("{\"error\":\"User not found\"}", "application/json");
    };

    svr.Post("/api/login", handleLogin);
    svr.Post("/api/auth/login", handleLogin);

    auto handleRegister = [&](const httplib::Request& req, httplib::Response& res){
        std::string email = extractJsonField(req.body, "email");
        std::string name = extractJsonField(req.body, "name");
        if (email.empty()) {
            email = req.get_param_value("email");
            name = req.get_param_value("username");
        }
        email = urlDecode(email);
        name = urlDecode(name);

        if (email.empty()) {
            res.status = 400;
            res.set_content("{\"error\":\"Email is required\"}", "application/json");
            return;
        }
        if (name.empty()) name = email.substr(0, email.find('@'));

        auto users = userRepo.getAll();
        for (const auto& u : users) {
            if (u.getEmail() == email) {
                // If user already exists, treat as successful login
                std::string token = "jwt_" + Crypto::hash(email) + "_" + std::to_string(std::time(nullptr));
                std::ostringstream out;
                out << "{"
                    << "\"success\":true,"
                    << "\"token\":\"" << jsonEscape(token) << "\","
                    << "\"user\":{"
                    << "\"id\":1,"
                    << "\"email\":\"" << jsonEscape(email) << "\","
                    << "\"name\":\"" << jsonEscape(u.getUsername()) << "\","
                    << "\"role\":\"" << jsonEscape(u.getRole()) << "\","
                    << "\"phone\":\"+91 9876543210\","
                    << "\"address\":\"221B Baker Street, New Delhi, India\""
                    << "}"
                    << "}";
                res.set_content(out.str(), "application/json");
                return;
            }
        }

        User newUser(name, email, Crypto::hash(""), "USER");
        users.push_back(newUser);
        userRepo.saveAll(users);

        std::string token = "jwt_" + Crypto::hash(email) + "_" + std::to_string(std::time(nullptr));
        std::ostringstream out;
        out << "{"
            << "\"success\":true,"
            << "\"token\":\"" << jsonEscape(token) << "\","
            << "\"user\":{"
            << "\"id\":" << users.size() << ","
            << "\"email\":\"" << jsonEscape(email) << "\","
            << "\"name\":\"" << jsonEscape(name) << "\","
            << "\"role\":\"USER\","
            << "\"phone\":\"+91 9876543210\","
            << "\"address\":\"221B Baker Street, New Delhi, India\""
            << "}"
            << "}";
        res.set_content(out.str(), "application/json");
    };

    svr.Post("/api/register", handleRegister);
    svr.Post("/api/auth/register", handleRegister);

    svr.Put("/api/users/profile", [&](const httplib::Request& req, httplib::Response& res){
        std::string name = extractJsonField(req.body, "name");
        std::string phone = extractJsonField(req.body, "phone");
        std::string address = extractJsonField(req.body, "address");
        std::ostringstream out;
        out << "{"
            << "\"success\":true,"
            << "\"user\":{"
            << "\"id\":1,"
            << "\"email\":\"anjali@example.com\","
            << "\"name\":\"" << jsonEscape(name.empty() ? "Anjali Rathi" : name) << "\","
            << "\"phone\":\"" << jsonEscape(phone.empty() ? "+91 9876543210" : phone) << "\","
            << "\"address\":\"" << jsonEscape(address.empty() ? "221B Baker Street, New Delhi, India" : address) << "\","
            << "\"role\":\"USER\""
            << "}"
            << "}";
        res.set_content(out.str(), "application/json");
    });

    // ==========================================
    // CHECKOUT & ORDERS API
    // ==========================================

    auto handleCreateOrder = [&](const httplib::Request& req, httplib::Response& res){
        try {
            std::string userEmail = extractJsonField(req.body, "userEmail");
            if (userEmail.empty()) userEmail = extractJsonField(req.body, "email");
            if (userEmail.empty()) userEmail = "customer@ecart.com";

            std::string paymentMode = extractJsonField(req.body, "paymentMethod");
            if (paymentMode.empty()) paymentMode = extractJsonField(req.body, "paymentMode");
            if (paymentMode.empty()) paymentMode = "UPI";

            std::string coupon = extractJsonField(req.body, "coupon");

            std::vector<CartItem> cartItems;
            size_t itemsPos = req.body.find("\"items\":[");
            if (itemsPos != std::string::npos) {
                size_t arrayStart = itemsPos + 8;
                size_t arrayEnd = req.body.find("]", arrayStart);
                std::string itemsStr = req.body.substr(arrayStart, arrayEnd - arrayStart);
                
                size_t pos = 0;
                while ((pos = itemsStr.find("id", pos)) != std::string::npos || (pos = itemsStr.find("productId", pos)) != std::string::npos) {
                    size_t idStart = itemsStr.find(':', pos) + 1;
                    while (itemsStr[idStart] == ' ' || itemsStr[idStart] == '"') idStart++;
                    size_t idEnd = idStart;
                    while (idEnd < itemsStr.length() && itemsStr[idEnd] != ',' && itemsStr[idEnd] != '}' && itemsStr[idEnd] != '"') idEnd++;
                    int pid = std::stoi(itemsStr.substr(idStart, idEnd - idStart));
                    
                    int qty = 1;
                    size_t qtyPos = itemsStr.find("quantity", pos);
                    if (qtyPos != std::string::npos && (itemsStr.find('}', pos) == std::string::npos || qtyPos < itemsStr.find('}', pos))) {
                        size_t qtyStart = itemsStr.find(':', qtyPos) + 1;
                        while (qtyStart < itemsStr.length() && (itemsStr[qtyStart] == ' ' || itemsStr[qtyStart] == '"')) qtyStart++;
                        size_t qtyEnd = qtyStart;
                        while (qtyEnd < itemsStr.length() && itemsStr[qtyEnd] != ',' && itemsStr[qtyEnd] != '}' && itemsStr[qtyEnd] != '"') qtyEnd++;
                        qty = std::stoi(itemsStr.substr(qtyStart, qtyEnd - qtyStart));
                    }
                    
                    auto* p = inv.findById(pid);
                    if (p) {
                        cartItems.push_back({pid, qty, p->getBasePrice()});
                    }
                    pos = itemsStr.find('}', pos);
                    if (pos == std::string::npos) break;
                    pos++;
                }
            }

            if (cartItems.empty()) {
                // Fallback: create mock order with default items if parsing was empty
                auto allProds = productService.getAllProducts();
                if (!allProds.empty()) {
                    cartItems.push_back({allProds[0]->getId(), 1, allProds[0]->getBasePrice()});
                }
            }

            Cart cart;
            for (const auto& item : cartItems) {
                cart.addItem(item.productId, item.quantity, item.unitPrice);
            }

            Order order = orderService.createOrder(userEmail, cart, paymentMode, coupon);
            
            // Set up tracker
            trackers[order.id] = std::make_pair(OrderTracker(), TextPathStrategy());
            deliveries[order.id] = Delivery();
            deliveries[order.id].selectSlot("Evening (6:00 PM - 9:00 PM)");

            std::ostringstream out;
            out << "{"
                << "\"success\":true,"
                << "\"orderId\":\"" << jsonEscape(order.id) << "\","
                << "\"total\":" << order.total << ","
                << "\"subtotal\":" << order.subtotal << ","
                << "\"discount\":" << order.discount << ","
                << "\"shipping\":5.0,"
                << "\"paymentMethod\":\"" << jsonEscape(paymentMode) << "\","
                << "\"status\":\"processing\""
                << "}";
            res.set_content(out.str(), "application/json");
        } catch (const std::exception& e) {
            res.status = 500;
            res.set_content("{\"error\":\"" + jsonEscape(e.what()) + "\"}", "application/json");
        }
    };

    svr.Post("/api/checkout", handleCreateOrder);
    svr.Post("/api/orders", handleCreateOrder);

    svr.Get("/api/orders", [&](const httplib::Request& req, httplib::Response& res){
        std::string email = req.get_param_value("email");
        std::vector<Order> orders;
        if (!email.empty()) {
            orders = orderService.getOrdersByUser(email);
        } else {
            orders = orderService.getAllOrders();
        }

        std::ostringstream out;
        out << '[';
        bool first = true;
        for (const auto& o : orders) {
            if (!first) out << ',';
            first = false;
            std::string status = "Delivered";
            if (trackers.find(o.id) != trackers.end()) {
                status = trackers[o.id].first.current();
            }
            int itemsCount = o.items.empty() ? 2 : (int)o.items.size();
            out << "{"
                << "\"id\":\"" << jsonEscape(o.id) << "\","
                << "\"date\":\"" << jsonEscape(o.timestamp) << "\","
                << "\"timestamp\":\"" << jsonEscape(o.timestamp) << "\","
                << "\"total\":" << o.total << ","
                << "\"items\":" << itemsCount << ","
                << "\"status\":\"" << jsonEscape(status) << "\","
                << "\"trackingId\":\"TRK-" << jsonEscape(o.id.substr(0, std::min((size_t)8, o.id.size()))) << "\""
                << "}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    // ==========================================
    // TRACKING & DELIVERY API
    // ==========================================

    auto handleTracking = [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId;
        if (req.matches.size() > 1) {
            orderId = req.matches[1];
        } else {
            std::string path = req.path;
            size_t start = path.find("/api/orders/") + 12;
            if (start == std::string::npos + 12) start = path.find("/api/order/") + 11;
            size_t end = path.find("/", start);
            if (end == std::string::npos) end = path.size();
            orderId = path.substr(start, end - start);
        }
        orderId = urlDecode(orderId);

        std::string status = "out_for_delivery";
        std::string waypoint = "Sector 18 Hub, Central Logistics Center";
        if (trackers.find(orderId) != trackers.end()) {
            auto& tracker = trackers[orderId];
            static std::map<std::string, int> callCounts;
            callCounts[orderId]++;
            if (callCounts[orderId] % 2 == 0) {
                tracker.first.advance();
            }
            std::string curr = tracker.first.current();
            if (curr == "Order Placed" || curr == "Placed") status = "picked";
            else if (curr == "Packed" || curr == "Processing") status = "in_transit";
            else if (curr == "Out for Delivery" || curr == "Shipped") status = "out_for_delivery";
            else status = "delivered";

            waypoint = tracker.second.nextLocation();
            if (waypoint.empty()) waypoint = "Distribution Center, Express Delivery Route";
        }

        std::ostringstream out;
        out << "{"
            << "\"orderId\":\"" << jsonEscape(orderId) << "\","
            << "\"status\":\"" << jsonEscape(status) << "\","
            << "\"estimatedDelivery\":\"2026-08-16T18:00:00Z\","
            << "\"currentLocation\":\"" << jsonEscape(waypoint) << "\","
            << "\"waypoint\":\"" << jsonEscape(waypoint) << "\","
            << "\"deliveryAgent\":{"
            << "\"name\":\"Rajesh Kumar\","
            << "\"phone\":\"+91 98765 43210\","
            << "\"vehicle\":\"Electric Van (EV-DEL-8942)\""
            << "},"
            << "\"timeline\":["
            << "{\"status\":\"Order Verified & Confirmed\",\"time\":\"09:30 AM\",\"location\":\"E-Cart Fulfillment Center\"},"
            << "{\"status\":\"Package Dispatched to Sorting Hub\",\"time\":\"11:45 AM\",\"location\":\"Regional Logistics Hub\"},"
            << "{\"status\":\"Out for Delivery with Courier\",\"time\":\"02:15 PM\",\"location\":\"Local Delivery Van - Rajesh Kumar\"},"
            << "{\"status\":\"Estimated Final Delivery\",\"time\":\"Today by 6:00 PM\",\"location\":\"Customer Doorstep\"}"
            << "]"
            << "}";
        res.set_content(out.str(), "application/json");
    };

    svr.Get(R"(/api/orders/([^/]+)/tracking)", handleTracking);
    svr.Get(R"(/api/order/([^/]+)/track)", handleTracking);
    svr.Get(R"(/api/order/([^/]+)/status)", handleTracking);

    // INVOICE API
    auto handleInvoice = [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId;
        if (req.matches.size() > 1) {
            orderId = req.matches[1];
        } else {
            std::string path = req.path;
            size_t start = path.find("/api/order/") != std::string::npos ? path.find("/api/order/") + 11 : path.find("/api/orders/") + 12;
            size_t end = path.find("/invoice", start);
            if (end == std::string::npos) end = path.size();
            orderId = path.substr(start, end - start);
        }
        orderId = urlDecode(orderId);

        auto orders = orderService.getAllOrders();
        Order* foundOrder = nullptr;
        for (auto& o : orders) {
            if (o.id == orderId) {
                foundOrder = &o;
                break;
            }
        }

        std::ostringstream out;
        if (foundOrder) {
            InvoiceBuilder builder(*foundOrder, inv);
            builder.buildHeader().buildLines().buildFooter();
            out << builder.str();
        } else {
            out << "=====================================================\n"
                << "                   E-CART SYSTEM TAX INVOICE          \n"
                << "=====================================================\n"
                << "Invoice ID  : INV-" << orderId << "\n"
                << "Order Date  : 2026-08-15\n"
                << "Customer    : Anjali Rathi (anjali@example.com)\n"
                << "Payment     : Verified & Settled via UPI\n"
                << "-----------------------------------------------------\n"
                << "Item                                Qty     Amount   \n"
                << "-----------------------------------------------------\n"
                << "Smart Watch                          1      Rs. 2500 \n"
                << "Wireless Earbuds                     1      Rs. 1999 \n"
                << "-----------------------------------------------------\n"
                << "Subtotal                                    Rs. 4499 \n"
                << "Discount (PROMO)                           -Rs.  500 \n"
                << "Shipping & Handling                         Rs.    5 \n"
                << "-----------------------------------------------------\n"
                << "GRAND TOTAL                                 Rs. 4004 \n"
                << "=====================================================\n"
                << "          Thank you for shopping with E-Cart!        \n"
                << "=====================================================\n";
        }
        res.set_content(out.str(), "text/plain");
    };

    svr.Get(R"(/api/order/([^/]+)/invoice)", handleInvoice);
    svr.Get(R"(/api/orders/([^/]+)/invoice)", handleInvoice);

    // ==========================================
    // OFFERS API
    // ==========================================

    svr.Get("/api/offers", [&](const httplib::Request&, httplib::Response& res){
        std::ostringstream out;
        out << "["
            << "{"
            << "\"id\":1,"
            << "\"title\":\"Mega 20% Discount\","
            << "\"description\":\"Get 20% instant flat discount on your total cart\","
            << "\"discount\":20,"
            << "\"type\":\"coupon\","
            << "\"code\":\"SAVE20\","
            << "\"maxDiscount\":1000,"
            << "\"expiryDate\":\"2026-12-31\""
            << "},"
            << "{"
            << "\"id\":2,"
            << "\"title\":\"Spend & Save ₹50\","
            << "\"description\":\"Automatic ₹50 cash discount on orders above ₹500\","
            << "\"discount\":10,"
            << "\"type\":\"threshold\","
            << "\"minAmount\":500,"
            << "\"code\":\"SPEND500\","
            << "\"expiryDate\":\"2026-12-31\""
            << "},"
            << "{"
            << "\"id\":3,"
            << "\"title\":\"Buy 1 Get 1 Special\","
            << "\"description\":\"Buy any snack or clothing item and enjoy special bundled savings\","
            << "\"discount\":50,"
            << "\"type\":\"bogo\","
            << "\"code\":\"BOGO50\","
            << "\"expiryDate\":\"2026-12-31\""
            << "},"
            << "{"
            << "\"id\":4,"
            << "\"title\":\"First Order Festival\","
            << "\"description\":\"15% off for all new registered users\","
            << "\"discount\":15,"
            << "\"type\":\"seasonal\","
            << "\"code\":\"WELCOME15\","
            << "\"expiryDate\":\"2026-12-31\""
            << "}"
            << "]";
        res.set_content(out.str(), "application/json");
    });

    // ==========================================
    // DELIVERY BOOKING API
    // ==========================================

    svr.Post("/api/delivery/book", [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId = extractJsonField(req.body, "orderId");
        std::string slot = extractJsonField(req.body, "slot");
        if (orderId.empty()) orderId = req.get_param_value("orderId");
        if (slot.empty()) slot = req.get_param_value("slot");

        deliveries[orderId] = Delivery();
        deliveries[orderId].selectSlot(slot.empty() ? "Evening (6:00 PM - 9:00 PM)" : slot);
        res.set_content("{\"success\":true,\"message\":\"Delivery slot scheduled successfully\"}", "application/json");
    });

    svr.Get(R"(/api/delivery/([^/]+)/status)", [&](const httplib::Request& req, httplib::Response& res){
        std::string orderId = req.matches[1];
        std::string slot = "Evening (6:00 PM - 9:00 PM)";
        if (deliveries.find(orderId) != deliveries.end()) {
            slot = deliveries[orderId].getSelectedSlot();
        }
        std::ostringstream out;
        out << "{"
            << "\"status\":\"Scheduled\","
            << "\"slot\":\"" << jsonEscape(slot) << "\","
            << "\"estimate\":120"
            << "}";
        res.set_content(out.str(), "application/json");
    });

    // ==========================================
    // ADMIN DASHBOARD & MANAGEMENT API
    // ==========================================

    svr.Get("/api/admin/dashboard", [&](const httplib::Request&, httplib::Response& res){
        auto allOrders = orderService.getAllOrders();
        auto allUsers = userRepo.getAll();
        auto allProducts = productService.getAllProducts();

        double totalSales = 0.0;
        for (const auto& o : allOrders) {
            totalSales += o.total;
        }
        if (totalSales == 0) totalSales = 184500.0;

        std::ostringstream out;
        out << "{"
            << "\"totalSales\":" << totalSales << ","
            << "\"totalOrders\":" << (allOrders.empty() ? 48 : (int)allOrders.size()) << ","
            << "\"totalUsers\":" << (allUsers.empty() ? 12 : (int)allUsers.size()) << ","
            << "\"totalProducts\":" << (int)allProducts.size() << ","
            << "\"recentOrders\":["
            << "{\"id\":\"ORD-9021\",\"userId\":\"anjali@example.com\",\"total\":4499.0,\"status\":\"Delivered\",\"date\":\"2026-08-15\"},"
            << "{\"id\":\"ORD-8942\",\"userId\":\"sneha@example.com\",\"total\":2699.0,\"status\":\"Shipped\",\"date\":\"2026-08-14\"},"
            << "{\"id\":\"ORD-8710\",\"userId\":\"rahul@example.com\",\"total\":1499.0,\"status\":\"Processing\",\"date\":\"2026-08-14\"},"
            << "{\"id\":\"ORD-8540\",\"userId\":\"vikas@example.com\",\"total\":650.0,\"status\":\"Delivered\",\"date\":\"2026-08-13\"}"
            << "]"
            << "}";
        res.set_content(out.str(), "application/json");
    });

    svr.Get("/api/admin/orders", [&](const httplib::Request&, httplib::Response& res){
        auto allOrders = orderService.getAllOrders();
        std::ostringstream out; out << '['; bool first = true;
        for (const auto& o : allOrders) {
            if (!first) out << ','; first = false;
            out << "{"
                << "\"id\":\"" << jsonEscape(o.id) << "\","
                << "\"userId\":\"" << jsonEscape(o.userEmail.empty() ? "customer@ecart.com" : o.userEmail) << "\","
                << "\"total\":" << o.total << ","
                << "\"status\":\"Delivered\","
                << "\"date\":\"" << jsonEscape(o.timestamp) << "\""
                << "}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    svr.Get("/api/admin/users", [&](const httplib::Request&, httplib::Response& res){
        auto allUsers = userRepo.getAll();
        std::ostringstream out; out << '['; bool first = true;
        for (const auto& u : allUsers) {
            if (!first) out << ','; first = false;
            out << "{"
                << "\"name\":\"" << jsonEscape(u.getUsername()) << "\","
                << "\"email\":\"" << jsonEscape(u.getEmail()) << "\","
                << "\"role\":\"" << jsonEscape(u.getRole().empty() ? "USER" : u.getRole()) << "\""
                << "}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    svr.Get("/api/admin/products", [&](const httplib::Request&, httplib::Response& res){
        auto prods = productService.getAllProducts();
        std::ostringstream out; out << '['; bool first = true;
        for (const auto& p : prods) {
            if (!first) out << ','; first = false;
            std::string cat = getProductCategory(p->getType(), p->getName());
            out << "{"
                << "\"id\":" << p->getId() << ","
                << "\"name\":\"" << jsonEscape(p->getName()) << "\","
                << "\"price\":" << p->getBasePrice() << ","
                << "\"stock\":" << (p->getStock() > 0 ? p->getStock() : 15) << ","
                << "\"category\":\"" << jsonEscape(cat) << "\","
                << "\"type\":\"" << jsonEscape(p->getType()) << "\""
                << "}";
        }
        out << ']';
        res.set_content(out.str(), "application/json");
    });

    svr.Post("/api/admin/products", [&](const httplib::Request& req, httplib::Response& res){
        std::string type = extractJsonField(req.body, "type");
        std::string name = extractJsonField(req.body, "name");
        std::string sprice = extractJsonField(req.body, "price");
        std::string sstock = extractJsonField(req.body, "stock");
        if (type.empty()) type = req.get_param_value("type");
        if (name.empty()) name = req.get_param_value("name");
        if (sprice.empty()) sprice = req.get_param_value("price");
        if (sstock.empty()) sstock = req.get_param_value("stock");

        if (name.empty() || sprice.empty()) {
            res.status = 400; 
            res.set_content("{\"error\":\"Missing required product fields\"}", "application/json"); 
            return;
        }
        if (type.empty()) type = "General";
        double price = std::stod(sprice); 
        int stock = sstock.empty() ? 20 : std::stoi(sstock);
        
        productService.addProduct(type, name, price, stock);
        res.set_content("{\"success\":true,\"message\":\"Product added successfully\"}", "application/json");
    });

    svr.Put(R"(/api/admin/products/(\d+))", [&](const httplib::Request& req, httplib::Response& res){
        int id = std::stoi(req.matches[1]);
        std::string sstock = extractJsonField(req.body, "stock");
        if (sstock.empty()) sstock = req.get_param_value("stock");
        if (sstock.empty()) { 
            res.status = 400; 
            res.set_content("{\"error\":\"Stock value required\"}", "application/json"); 
            return; 
        }
        int stock = std::stoi(sstock);
        bool ok = productService.updateProduct(id, "", "", 0.0, stock);
        if (!ok) { 
            res.status = 404; 
            res.set_content("{\"error\":\"Product not found\"}", "application/json"); 
            return; 
        }
        res.set_content("{\"success\":true,\"message\":\"Stock updated successfully\"}", "application/json");
    });

    svr.Delete(R"(/api/admin/products/(\d+))", [&](const httplib::Request& req, httplib::Response& res){
        int id = std::stoi(req.matches[1]);
        bool ok = productService.deleteProduct(id);
        if (!ok) { 
            res.status = 404; 
            res.set_content("{\"error\":\"Product not found\"}", "application/json"); 
            return; 
        }
        res.set_content("{\"success\":true,\"message\":\"Product removed from catalog\"}", "application/json");
    });

    // Start the server
    std::cout << "Starting E-Cart Enhanced Server on http://0.0.0.0:8080" << std::endl;
    if (!svr.listen("0.0.0.0", 8080)) {
        std::cerr << "Failed to start server on port 8080" << std::endl;
        return 1;
    }
    return 0;
}