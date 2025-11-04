#include "product.h"
#include <iostream>
#include <numeric>

Product::Product(int id, std::string n, double p, int s)
    : id(id), name(std::move(n)), basePrice(p), stock(s) {}

int Product::getId() const { return id; }
const std::string& Product::getName() const { return name; }
int Product::getStock() const { return stock; }
void Product::setStock(int s) { stock = s; }

// Review management implementation
void Product::addReview(std::unique_ptr<Review> review) {
    reviews.push_back(std::move(review));
}

const std::vector<std::unique_ptr<Review>>& Product::getReviews() const {
    return reviews;
}

double Product::getAverageRating() const {
    if (reviews.empty()) return 0.0;
    double sum = 0.0;
    for (const auto& review : reviews) {
        if (auto* textReview = dynamic_cast<TextReview*>(review.get())) {
            sum += textReview->getRating();
        } else if (auto* ratingReview = dynamic_cast<RatingReview*>(review.get())) {
            sum += ratingReview->getRating();
        }
    }
    return sum / reviews.size();
}

void Product::displayReviews() const {
    std::cout << "Reviews for " << name << ":\n";
    if (reviews.empty()) {
        std::cout << "No reviews yet.\n";
        return;
    }
    for (const auto& review : reviews) {
        review->display();
        std::cout << "---\n";
    }
    std::cout << "Average Rating: " << getAverageRating() << "/5\n";
}


