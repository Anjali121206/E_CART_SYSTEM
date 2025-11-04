#pragma once

#include "../../infra/order_repository.h"
#include "../order.h"
#include "../cart.h"
#include "../inventory.h"
#include "../../infra/product_repository.h"
#include <string>
#include <vector>

class OrderService {
private:
    OrderRepository& orderRepository;
    Inventory& inventory;
    ProductRepository& productRepository;


public:
    OrderService(OrderRepository& repo, Inventory& inv, ProductRepository& prodRepo);

    Order createOrder(const std::string& userEmail, Cart& cart, const std::string& paymentMode, const std::string& coupon);
    std::vector<Order> getAllOrders();
    std::vector<Order> getOrdersByUser(const std::string& userEmail);
};
