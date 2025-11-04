#pragma once
#include "core/product.h"
#include <string>

class Snack : public Product {
    std::string expiryDate;
    std::string category;
    double rating;
public:
    Snack(int id, std::string n, double p, int s, std::string expiry, std::string cat, double rat);
    void displayDetails() const override;
    double getPrice() const override;
    std::string getType() const override { return "Snack"; }
    std::string getCategory() const { return category; }
    double getRating() const { return rating; }
};
