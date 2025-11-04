#pragma once
#include <vector>
#include <string>
#include <memory>

struct CartItem { int productId; int quantity; double unitPrice; };

class Product;

class Cart {
private:
    std::vector<CartItem> items;
public:
    void addItem(int productId, int quantity, double unitPrice);
    void removeItem(int productId);
    void setQuantity(int productId, int quantity);
    const std::vector<CartItem>& getItems() const;
    double calculateSubtotal() const;
    double applyDiscounts(const std::string& couponCode) const;
    double calculateTax(double percent) const;
    double calculateTotal(double taxPercent, const std::string& couponCode) const;
    bool validateStock(const std::vector<std::unique_ptr<Product>>& inventory) const;
};


