#include "wishlist_service.h"

void WishlistService::addProductToWishlist(User& user, int productId) {
    user.getWishlist().addProduct(productId);
}

void WishlistService::removeProductFromWishlist(User& user, int productId) {
    user.getWishlist().removeProduct(productId);
}

const std::vector<int>& WishlistService::getWishlistProducts(const User& user) {
    return user.getWishlist().getProductIds();
}
