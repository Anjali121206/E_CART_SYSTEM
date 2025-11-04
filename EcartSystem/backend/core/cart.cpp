#include "cart.h"
#include <algorithm>
#include <string>
#include "price_policy.h"
#include "product.h"

void Cart::addItem(int productId, int quantity, double unitPrice) {
    for (auto &it : items) {
        if (it.productId == productId) { it.quantity += quantity; return; }
    }
    items.push_back({productId, quantity, unitPrice});
}

void Cart::removeItem(int productId) {
    items.erase(std::remove_if(items.begin(), items.end(), [&](const CartItem& i){ return i.productId == productId; }), items.end());
}

void Cart::setQuantity(int productId, int quantity) {
    for (auto &it : items) if (it.productId == productId) { it.quantity = quantity; return; }
}

const std::vector<CartItem>& Cart::getItems() const { return items; }

double Cart::calculateSubtotal() const {
    double sum = 0.0; for (const auto& i : items) sum += i.unitPrice * i.quantity; return sum;
}

double Cart::applyDiscounts(const std::string& couponCode) const {
    double subtotal = calculateSubtotal();
    auto policy = policyForCoupon(couponCode);
    if (!policy) return 0.0;
    PricingContext ctx; ctx.setPolicy(std::move(policy));
    double discounted = ctx.calculatePrice(subtotal);
    if (discounted < 0) discounted = 0;
    double discount = subtotal - discounted;
    if (discount < 0) discount = 0;
    if (discount > subtotal) discount = subtotal;
    return discount;
}

double Cart::calculateTax(double percent) const {
    return calculateSubtotal() * (percent / 100.0);
}

double Cart::calculateTotal(double taxPercent, const std::string& couponCode) const {
    double subtotal = calculateSubtotal();
    double discount = applyDiscounts(couponCode);
    double tax = (subtotal - discount) * (taxPercent / 100.0);
    return subtotal - discount + tax;
}

bool Cart::validateStock(const std::vector<std::unique_ptr<Product>>& inventory) const {
    for (const auto& item : items) {
        auto it = std::find_if(inventory.begin(), inventory.end(),
            [&](const std::unique_ptr<Product>& p) { return p->getId() == item.productId; });
        if (it == inventory.end() || (*it)->getStock() < item.quantity) {
            return false;
        }
    }
    return true;
}


