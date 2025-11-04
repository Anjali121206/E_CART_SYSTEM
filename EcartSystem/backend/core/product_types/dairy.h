#pragma once
#include "core/product.h"
#include <string>

class Dairy : public Product {
    std::string expiryDate;
    std::string category;
    double rating;
public:
    Dairy(int id, std::string n, double p, int s, std::string expiry, std::string cat, double rat);
    void displayDetails() const override;
    double getPrice() const override;
    std::string getType() const override { return "Dairy"; }
    std::string getCategory() const { return category; }
    double getRating() const { return rating; }
};
