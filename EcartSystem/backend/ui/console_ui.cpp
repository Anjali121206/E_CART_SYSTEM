#include "console_ui.h"
#include <iostream>
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
#include <memory>
#include "ui/ansi.h"
#include "infra/logger.h"
#include "infra/file_store.h"
#include "utils/crypto.h"
#include "utils/time.h"
#include "core/price_policy.h"
#include "core/admin.h"
#include "core/notification.h"

using std::cout; using std::cin; using std::string; using std::endl;

void ConsoleUI::run() {
    userRepo = std::make_unique<UserRepository>(config.get().users);
    productRepo = std::make_unique<ProductRepository>(config.get().products);
    orderRepo = std::make_unique<OrderRepository>(config.get().orders);
    inventory.getProducts() = productRepo->getAll();

    // Subscribe to inventory notifications
    auto emailObserver = std::make_unique<EmailNotification>("admin@ecart.com");
    auto smsObserver = std::make_unique<SMSNotification>("1234567890");
    inventory.subscribeToNotifications(std::move(emailObserver));
    inventory.subscribeToNotifications(std::move(smsObserver));

    mainMenu();
}

static void clearInput(){ std::cin.clear(); std::cin.ignore(10000, '\n'); }

void ConsoleUI::mainMenu() {
    int choice = 0;
    while (true) {
        cout << Ansi::cyan << "========================================\n"
             << "         E-CART MANAGEMENT SYSTEM\n"
             << "========================================\n" << Ansi::reset
             << "1. User Login\n2. User Registration\n3. Admin Login\n4. Exit\n"
             << "----------------------------------------\nEnter your choice: ";
        if (!(cin >> choice)) { clearInput(); continue; }
        if (choice == 1) {
            string email, password; cout << "Email: "; cin >> email; cout << "Password: "; cin >> password;
            auto users = userRepo->getAll(); bool ok=false; string role="USER";
            for (const auto& u : users) { if (u.login(email, password)) { ok=true; role=u.getRole(); break; } }
            if (!ok) { cout << Ansi::red << "Invalid credentials\n" << Ansi::reset; continue; }
            currentUserEmail = email;
            userDashboard(email);
        } else if (choice == 2) {
            string name, email, password; cout << "Name: "; cin >> name; cout << "Email: "; cin >> email; cout << "Password: "; cin >> password;
            auto users = userRepo->getAll(); bool exists=false; for (auto& u:users) if (u.getEmail()==email) { exists=true; break; }
            if (exists) { cout << Ansi::yellow << "User already exists.\n" << Ansi::reset; continue; }
            users.emplace_back(name, email, Crypto::hash(password), "USER");
            userRepo->saveAll(users); cout << Ansi::green << "Registered successfully.\n" << Ansi::reset;
        } else if (choice == 3) {
            string email, password; cout << "Admin Email: "; cin >> email; cout << "Password: "; cin >> password;
            auto users = userRepo->getAll(); bool ok=false; for (auto& u:users) if (u.login(email,password) && u.getRole()=="ADMIN") ok=true;
            if (!ok) { cout << Ansi::red << "Invalid admin credentials\n" << Ansi::reset; continue; }
            adminDashboard();
        } else if (choice == 4) { break; }
    }
}

void ConsoleUI::browseProducts() {
    cout << Ansi::cyan << "\nAvailable Products\n" << Ansi::reset;
    for (const auto& p : inventory.getProducts()) { p->displayDetails(); }
}

void ConsoleUI::addToCart() {
    int id, qty; cout << "Enter Product ID: "; if (!(cin>>id)) { clearInput(); return; }
    auto* p = inventory.findById(id); if (!p) { cout << Ansi::red << "Not found\n" << Ansi::reset; return; }
    cout << "Quantity: "; if (!(cin>>qty)) { clearInput(); return; }
    if (qty<=0 || qty>p->getStock()) { cout << Ansi::yellow << "Invalid quantity\n" << Ansi::reset; return; }
    DefaultPricePolicy policy; double unit = policy.priceFor(*p);
    cart.addItem(p->getId(), qty, unit); cout << Ansi::green << "Added to cart\n" << Ansi::reset;
}

void ConsoleUI::viewCart() {
    cout << Ansi::cyan << "\nYour Cart\n" << Ansi::reset;
    double subtotal = 0; for (const auto& i : cart.getItems()) {
        auto* p = inventory.findById(i.productId); if (!p) continue;
        cout << p->getName() << " x" << i.quantity << " — Rs. " << (i.unitPrice * i.quantity) << "\n";
        subtotal += i.unitPrice * i.quantity;
    }
    cout << "Subtotal: Rs. " << subtotal << "\n";
}

void ConsoleUI::checkout() {
    if (cart.getItems().empty()) { cout << Ansi::yellow << "Cart is empty\n" << Ansi::reset; return; }
    string coupon; cout << "Coupon (or blank): "; cin >> coupon; if (coupon=="-") coupon.clear();
    double total = cart.calculateTotal(5.0, coupon);
    cout << "Select Payment: 1) UPI 2) Card 3) COD: "; int m=1; if (!(cin>>m)) { clearInput(); return; }
    std::unique_ptr<Payment> pay; string mode;
    if (m==1){ pay = std::make_unique<UpiPayment>(); mode="UPI"; }
    else if (m==2){ pay = std::make_unique<CardPayment>(); mode="CARD"; }
    else { pay = std::make_unique<CashOnDelivery>(); mode="COD"; }
    try { pay->makePayment(total); } catch (const std::exception& ex) { cout << Ansi::red << ex.what() << "\n" << Ansi::reset; return; }
    // Persist order
    Order o; o.id = TimeUtil::nowIso(); o.userEmail = currentUserEmail; o.timestamp = o.id; o.subtotal = cart.calculateSubtotal();
    o.discount = cart.applyDiscounts(coupon); o.tax = (o.subtotal - o.discount) * 0.05; o.total = total; o.paymentMode = mode;
    for (auto it : cart.getItems()) o.items.push_back(it);
    orderRepo->append(o);
    // Update stock
    for (const auto& it : cart.getItems()) { auto* p = inventory.findById(it.productId); if (p) p->setStock(p->getStock()-it.quantity); }
    productRepo->saveAll(inventory.getProducts());
    // Write invoice
    fs::create_directories("../data/invoices");
    std::ofstream inv("../data/invoices/" + o.id + ".txt");
    inv << "========================================\n         E-CART INVOICE\n========================================\n";
    inv << "Customer: " << currentUserEmail << "\nItems:\n";
    for (const auto& it : o.items) { auto* p = inventory.findById(it.productId); if (p) inv << p->getName() << "  - Rs. " << it.unitPrice << " x" << it.quantity << "\n"; }
    inv << "----------------------------------------\nSubtotal: Rs. " << o.subtotal << "\nDiscount: Rs. " << o.discount << "\nTax (5%): Rs. " << o.tax << "\n----------------------------------------\nTotal: Rs. " << o.total << "\nPayment Mode: " << o.paymentMode << "\n----------------------------------------\nThank you for shopping with us!\n";
    inv.close();
    FileStore::appendLine(config.get().sales, o.id + "|" + currentUserEmail + "|" + std::to_string(o.total));
    cout << Ansi::green << "Order placed. Invoice saved to data/invoices/" << o.id << ".txt\n" << Ansi::reset;
    cart = Cart{}; // clear cart
}

void ConsoleUI::userDashboard(const std::string& userEmail) {
    (void)userEmail;
    int c = 0;
    while (true) {
        cout << "\nUser Dashboard\n"
             << "1. Browse Products\n2. Add to Cart\n3. View Cart\n4. Checkout\n5. Logout\n"
             << "Enter: ";
        if (!(cin >> c)) { clearInput(); continue; }
        if (c == 1) browseProducts();
        else if (c == 2) addToCart();
        else if (c == 3) viewCart();
        else if (c == 4) checkout();
        else if (c == 5) break;
    }
}

void ConsoleUI::adminDashboard() {
    Admin admin("Admin", "admin@ecart.com", "hashedpassword");
    admin.setSalesData(orderRepo->getAll());

    int c = 0;
    while (true) {
        cout << "\nAdmin Dashboard\n"
             << "1. Add Product\n2. Remove Product\n3. Update Product Stock\n4. View Sales Report\n5. View Inventory Report\n6. View Low Stock Alerts\n7. View User Statistics\n8. Generate System Report\n9. Logout\n"
             << "Enter: ";
        if (!(cin >> c)) { clearInput(); continue; }
        if (c == 1) admin.addProduct(inventory);
        else if (c == 2) {
            cout << "Enter product ID to remove: ";
            int id;
            cin >> id;
            admin.removeProduct(inventory, id);
        } else if (c == 3) {
            cout << "Enter product ID: ";
            int id;
            cin >> id;
            cout << "Enter new stock: ";
            int stock;
            cin >> stock;
            admin.updateProductStock(inventory, id, stock);
        } else if (c == 4) admin.viewSalesReport();
        else if (c == 5) admin.viewInventoryReport(inventory);
        else if (c == 6) admin.viewLowStockAlerts(inventory);
        else if (c == 7) admin.viewUserStatistics();
        else if (c == 8) admin.generateSystemReport();
        else if (c == 9) break;
    }
}


