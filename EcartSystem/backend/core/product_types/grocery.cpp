#include "grocery.h"
#include <iostream>

Grocery::Grocery(int id, std::string n, double p, int s, std::string expiry, double weight)
    : Product(id, std::move(n), p, s), expiryDate(std::move(expiry)), weightKg(weight) {}

void Grocery::displayDetails() const {
    std::cout << "[Grocery] " << name << " (ID: " << id << ") - Rs. " << basePrice
              << ", Stock: " << stock << ", Expiry: " << expiryDate
              << ", Weight: " << weightKg << "kg\n";
}

double Grocery::getPrice() const { return basePrice; }


