#include "electronics.h"
#include <iostream>

Electronics::Electronics(int id, std::string n, double p, int s, std::string b, int w)
    : Product(id, std::move(n), p, s), brand(std::move(b)), warrantyMonths(w) {}

void Electronics::displayDetails() const {
    std::cout << "[Electronics] " << name << " (ID: " << id << ") - Rs. " << basePrice
              << ", Stock: " << stock << ", Brand: " << brand
              << ", Warranty: " << warrantyMonths << " months\n";
}

double Electronics::getPrice() const { return basePrice; }


