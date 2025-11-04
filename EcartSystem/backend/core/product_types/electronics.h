#pragma once
#include "core/product.h"
#include <string>

class Electronics : public Product {
    std::string brand;
    int warrantyMonths;
public:
    Electronics(int id, std::string n, double p, int s, std::string b, int w);
    void displayDetails() const override;
    double getPrice() const override;
    std::string getType() const override { return "Electronics"; }
};


