#pragma once
#include <string>
#include <vector>
#include <memory>
#include "review.h"

class Product {
protected:
    int id;
    std::string name;
    double basePrice;
    int stock;
    std::vector<std::unique_ptr<Review>> reviews;
public:
    Product(int id, std::string n, double p, int s);
    virtual ~Product() = default;
    virtual void displayDetails() const = 0;
    virtual double getPrice() const = 0;
    virtual std::string getType() const = 0;
    int getId() const;
    const std::string& getName() const;
    double getBasePrice() const { return basePrice; }
    int getStock() const;
    void setStock(int s);

    // Review management
    void addReview(std::unique_ptr<Review> review);
    const std::vector<std::unique_ptr<Review>>& getReviews() const;
    double getAverageRating() const;
    void displayReviews() const;
};


