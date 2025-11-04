#include "clothing.h"
#include <iostream>

Clothing::Clothing(int id, std::string n, double p, int s, std::string sz, std::string c, std::string m)
    : Product(id, std::move(n), p, s), size(std::move(sz)), color(std::move(c)), material(std::move(m)) {}

void Clothing::displayDetails() const {
    std::cout << "[Clothing] " << name << " (ID: " << id << ") - Rs. " << basePrice
              << ", Stock: " << stock << ", Size: " << size
              << ", Color: " << color << ", Material: " << material << "\n";
}

double Clothing::getPrice() const { return basePrice; }


