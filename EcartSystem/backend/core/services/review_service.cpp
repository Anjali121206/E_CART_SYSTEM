#include "review_service.h"

void ReviewService::addReview(Product& product, std::unique_ptr<Review> review) {
    product.addReview(std::move(review));
}

const std::vector<std::unique_ptr<Review>>& ReviewService::getReviews(const Product& product) {
    return product.getReviews();
}
