#pragma once
#include <string>
#include <vector>
#include "cart.h"

struct Order {
    std::string id;
    std::string userEmail;
    std::string timestamp;
    std::vector<CartItem> items;
    double subtotal{0}, discount{0}, tax{0}, total{0};
    std::string paymentMode;
    std::string serialize() const;
    static Order deserialize(const std::string& line);
};


