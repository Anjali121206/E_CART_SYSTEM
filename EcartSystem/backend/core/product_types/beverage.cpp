#include "beverage.h"
#include <iostream>

Beverage::Beverage(int id, std::string n, double p, int s, std::string expiry, std::string cat, double rat)
    : Product(id, std::move(n), p, s), expiryDate(std::move(expiry)), category(std::move(cat)), rating(rat) {}

void Beverage::displayDetails() const {
    std::cout << "[Beverage] " << name << " (ID: " << id << ") - Rs. " << basePrice
              << ", Stock: " << stock << ", Expiry: " << expiryDate
              << ", Category: " << category << ", Rating: " << rating << "/5\n";
}

double Beverage::getPrice() const { return basePrice; }
