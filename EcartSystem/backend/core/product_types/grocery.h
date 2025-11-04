#pragma once
#include "core/product.h"
#include <string>

class Grocery : public Product {
    std::string expiryDate;
    double weightKg;
public:
    Grocery(int id, std::string n, double p, int s, std::string expiry, double weight);
    void displayDetails() const override;
    double getPrice() const override;
    std::string getType() const override { return "Grocery"; }
};


