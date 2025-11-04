#pragma once
#include <vector>
#include <memory>
#include "product.h"

class Wishlist {
private:
    std::string userEmail;
    std::vector<int> productIds; // Store product IDs instead of pointers for persistence
public:
    Wishlist() = default;
    explicit Wishlist(std::string userEmail);
    ~Wishlist() = default;

    // Wishlist operations
    void addProduct(int productId);
    void removeProduct(int productId);
    bool containsProduct(int productId) const;
    const std::vector<int>& getProductIds() const;
    void clear();

    // Persistence
    std::string serialize() const;
    void deserialize(const std::string& data);

    // Display
    void display(const std::vector<std::unique_ptr<Product>>& allProducts) const;

    const std::string& getUserEmail() const;
};
