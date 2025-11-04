#pragma once
#include "core/product.h"
#include <string>

class Clothing : public Product {
    std::string size;
    std::string color;
    std::string material;
public:
    Clothing(int id, std::string n, double p, int s, std::string sz, std::string c, std::string m);
    void displayDetails() const override;
    double getPrice() const override;
    std::string getType() const override { return "Clothing"; }
};


