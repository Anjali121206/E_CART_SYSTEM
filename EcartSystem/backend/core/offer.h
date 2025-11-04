#pragma once
#include <string>
#include <memory>

class Offer {
public:
    virtual ~Offer() = default;
    virtual double applyDiscount(double amount) const = 0;
    virtual std::string getDescription() const = 0;
    virtual std::string getType() const = 0;
};

class CouponOffer : public Offer {
private:
    double percentage;
    std::string code;
public:
    CouponOffer(double pct, std::string c) : percentage(pct), code(std::move(c)) {}
    double applyDiscount(double amount) const override;
    std::string getDescription() const override;
    std::string getType() const override { return "Coupon"; }
    std::string getCode() const { return code; }
};

class ThresholdOffer : public Offer {
private:
    double threshold;
    double discountAmount;
    std::string description;
public:
    ThresholdOffer(double thresh, double discount, std::string desc)
        : threshold(thresh), discountAmount(discount), description(std::move(desc)) {}
    double applyDiscount(double amount) const override;
    std::string getDescription() const override;
    std::string getType() const override { return "Threshold"; }
};

class BOGOOffer : public Offer {
private:
    int buyQuantity;
    int freeQuantity;
    std::string productType;
public:
    BOGOOffer(int buy, int free, std::string type)
        : buyQuantity(buy), freeQuantity(free), productType(std::move(type)) {}
    double applyDiscount(double amount) const override;
    std::string getDescription() const override;
    std::string getType() const override { return "BOGO"; }
};
