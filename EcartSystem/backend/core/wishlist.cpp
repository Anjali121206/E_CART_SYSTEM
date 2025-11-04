#include "wishlist.h"
#include <iostream>
#include <sstream>
#include <algorithm>

Wishlist::Wishlist(std::string userEmail) : userEmail(std::move(userEmail)) {}

void Wishlist::addProduct(int productId) {
    if (!containsProduct(productId)) {
        productIds.push_back(productId);
    }
}

void Wishlist::removeProduct(int productId) {
    productIds.erase(std::remove(productIds.begin(), productIds.end(), productId), productIds.end());
}

bool Wishlist::containsProduct(int productId) const {
    return std::find(productIds.begin(), productIds.end(), productId) != productIds.end();
}

const std::vector<int>& Wishlist::getProductIds() const {
    return productIds;
}

void Wishlist::clear() {
    productIds.clear();
}

std::string Wishlist::serialize() const {
    std::ostringstream oss;
    oss << userEmail;
    for (int id : productIds) {
        oss << "," << id;
    }
    return oss.str();
}

void Wishlist::deserialize(const std::string& data) {
    std::istringstream iss(data);
    std::string token;
    std::getline(iss, userEmail, ',');
    productIds.clear();
    while (std::getline(iss, token, ',')) {
        productIds.push_back(std::stoi(token));
    }
}

void Wishlist::display(const std::vector<std::unique_ptr<Product>>& allProducts) const {
    std::cout << "Wishlist for " << userEmail << ":\n";
    if (productIds.empty()) {
        std::cout << "Wishlist is empty.\n";
        return;
    }
    for (int productId : productIds) {
        for (const auto& product : allProducts) {
            if (product->getId() == productId) {
                std::cout << "- " << product->getName() << " ($" << product->getPrice() << ")\n";
                break;
            }
        }
    }
}

const std::string& Wishlist::getUserEmail() const {
    return userEmail;
}
