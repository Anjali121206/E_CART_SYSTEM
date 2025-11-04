#include "offer.h"
#include <sstream>

// CouponOffer implementation
double CouponOffer::applyDiscount(double amount) const {
    return amount * (1.0 - percentage / 100.0);
}

std::string CouponOffer::getDescription() const {
    std::ostringstream oss;
    oss << percentage << "% off with code " << code;
    return oss.str();
}

// ThresholdOffer implementation
double ThresholdOffer::applyDiscount(double amount) const {
    if (amount >= threshold) {
        return amount - discountAmount;
    }
    return amount;
}

std::string ThresholdOffer::getDescription() const {
    std::ostringstream oss;
    oss << "Rs. " << discountAmount << " off on orders above Rs. " << threshold;
    return oss.str();
}

// BOGOOffer implementation
double BOGOOffer::applyDiscount(double amount) const {
    // For simplicity, assume a fixed discount for BOGO
    // In a real implementation, this would need cart item details
    return amount * 0.9; // 10% discount as placeholder
}

std::string BOGOOffer::getDescription() const {
    std::ostringstream oss;
    oss << "Buy " << buyQuantity << " Get " << freeQuantity << " Free on " << productType;
    return oss.str();
}
