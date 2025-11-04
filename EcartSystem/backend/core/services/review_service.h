#pragma once

#include "../product.h"
#include "../review.h"
#include <vector>
#include <memory>

class ReviewService {
public:
    void addReview(Product& product, std::unique_ptr<Review> review);
    const std::vector<std::unique_ptr<Review>>& getReviews(const Product& product);
};
