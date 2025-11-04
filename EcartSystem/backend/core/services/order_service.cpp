#include "order_service.h"
#include "../../utils/time.h"
#include "../payment.h"
#include <stdexcept>

OrderService::OrderService(OrderRepository& repo, Inventory& inv, ProductRepository& prodRepo)
    : orderRepository(repo), inventory(inv), productRepository(prodRepo) {}

Order OrderService::createOrder(const std::string& userEmail, Cart& cart, const std::string& paymentMode, const std::string& coupon) {
    if (cart.getItems().empty()) {
        throw std::runtime_error("Empty cart");
    }

    double total = cart.calculateTotal(5.0, coupon);

    std::unique_ptr<Payment> pay;
    if (paymentMode == "CARD") {
        pay = std::make_unique<CardPayment>();
    } else if (paymentMode == "COD") {
        pay = std::make_unique<CashOnDelivery>();
    } else {
        pay = std::make_unique<UpiPayment>();
    }

    try {
        pay->makePayment(total);
    } catch (...) {
        throw std::runtime_error("Payment failed");
    }

    Order o;
    o.id = TimeUtil::nowCompact();
    o.userEmail = userEmail;
    o.timestamp = TimeUtil::nowIso();
    o.subtotal = cart.calculateSubtotal();
    o.discount = cart.applyDiscounts(coupon);
    o.tax = (o.subtotal - o.discount) * 0.05;
    o.total = total;
    o.paymentMode = paymentMode;
    for (auto it : cart.getItems()) {
        o.items.push_back(it);
    }

    orderRepository.append(o);

    for (const auto& it : cart.getItems()) {
        auto* p = inventory.findById(it.productId);
        if (p) {
            p->setStock(p->getStock() - it.quantity);
        }
    }
    productRepository.saveAll(inventory.getProducts());

    return o;
}

std::vector<Order> OrderService::getAllOrders() {
    return orderRepository.getAll();
}

std::vector<Order> OrderService::getOrdersByUser(const std::string& userEmail) {
    std::vector<Order> userOrders;
    auto allOrders = orderRepository.getAll();
    for (const auto& order : allOrders) {
        if (order.userEmail == userEmail) {
            userOrders.push_back(order);
        }
    }
    return userOrders;
}
