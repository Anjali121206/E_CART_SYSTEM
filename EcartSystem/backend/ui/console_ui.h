#pragma once
#include <string>
#include <memory>
#include "infra/config.h"
#include "infra/user_repository.h"
#include "infra/product_repository.h"
#include "infra/order_repository.h"
#include "core/inventory.h"
#include "core/cart.h"
#include "core/payment.h"

class ConsoleUI {
    Config config;
    std::unique_ptr<UserRepository> userRepo;
    std::unique_ptr<ProductRepository> productRepo;
    std::unique_ptr<OrderRepository> orderRepo;
    Inventory inventory;
    Cart cart;
    std::string currentUserEmail;
public:
    explicit ConsoleUI(const Config& cfg) : config(cfg) {}
    void run();
private:
    void mainMenu();
    void userDashboard(const std::string& userEmail);
    void adminDashboard();
    void browseProducts();
    void addToCart();
    void viewCart();
    void checkout();
};


