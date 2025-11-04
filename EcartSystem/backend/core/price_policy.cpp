#include "price_policy.h"
#include <sstream>

// PercentageDiscount implementation
double PercentageDiscount::applyDiscount(double basePrice, double discountValue) const {
    return basePrice * (1.0 - percentage / 100.0);
}

std::string PercentageDiscount::getDescription() const {
    std::ostringstream oss;
    oss << percentage << "% discount";
    return oss.str();
}

// FixedDiscount implementation
double FixedDiscount::applyDiscount(double basePrice, double discountValue) const {
    return basePrice - fixedAmount;
}

std::string FixedDiscount::getDescription() const {
    std::ostringstream oss;
    oss << "$" << fixedAmount << " off";
    return oss.str();
}

// SeasonalDiscount implementation
double SeasonalDiscount::applyDiscount(double basePrice, double discountValue) const {
    return basePrice * (1.0 - percentage / 100.0);
}

std::string SeasonalDiscount::getDescription() const {
    std::ostringstream oss;
    oss << seasonName << " special: " << percentage << "% off";
    return oss.str();
}

// PricingContext implementation
void PricingContext::setPolicy(std::unique_ptr<PricePolicy> p) {
    policy = std::move(p);
}

double PricingContext::calculatePrice(double basePrice, double discountValue) const {
    if (policy) {
        return policy->applyDiscount(basePrice, discountValue);
    }
    return basePrice;
}

std::string PricingContext::getPolicyDescription() const {
    if (policy) {
        return policy->getDescription();
    }
    return "No discount";
}

std::unique_ptr<PricePolicy> policyForCoupon(const std::string& couponCode) {
    if (couponCode == "PCT10") return std::make_unique<PercentageDiscount>(10.0);
    if (couponCode == "SEASONAL15") return std::make_unique<SeasonalDiscount>(15.0, "Seasonal");
    if (couponCode == "FIXED200") return std::make_unique<FixedDiscount>(200.0);
    return nullptr;
}