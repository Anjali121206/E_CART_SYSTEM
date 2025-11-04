#pragma once
#include <memory>
#include <string>
#include "product.h"

// Strategy Pattern for Pricing Policies
class PricePolicy {
public:
    virtual ~PricePolicy() = default;
    virtual double applyDiscount(double basePrice, double discountValue) const = 0;
    virtual std::string getDescription() const = 0;
};

class PercentageDiscount : public PricePolicy {
private:
    double percentage;
public:
    explicit PercentageDiscount(double pct) : percentage(pct) {}
    double applyDiscount(double basePrice, double discountValue) const override;
    std::string getDescription() const override;
};

class FixedDiscount : public PricePolicy {
private:
    double fixedAmount;
public:
    explicit FixedDiscount(double amount) : fixedAmount(amount) {}
    double applyDiscount(double basePrice, double discountValue) const override;
    std::string getDescription() const override;
};

class SeasonalDiscount : public PricePolicy {
private:
    double percentage;
    std::string seasonName;
public:
    SeasonalDiscount(double pct, std::string season) : percentage(pct), seasonName(std::move(season)) {}
    double applyDiscount(double basePrice, double discountValue) const override;
    std::string getDescription() const override;
};

class PricingContext {
private:
    std::unique_ptr<PricePolicy> policy;
public:
    void setPolicy(std::unique_ptr<PricePolicy> p);
    double calculatePrice(double basePrice, double discountValue = 0.0) const;
    std::string getPolicyDescription() const;
};

class DefaultPricePolicy {
public:
    double priceFor(const Product& product) const {
        return product.getPrice();
    }
};

// Helper to pick pricing policy from coupon code
std::unique_ptr<PricePolicy> policyForCoupon(const std::string& couponCode);