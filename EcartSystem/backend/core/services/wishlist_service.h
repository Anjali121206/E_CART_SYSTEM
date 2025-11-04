#pragma once

#include "../user.h"
#include <string>

class WishlistService {
public:
    void addProductToWishlist(User& user, int productId);
    void removeProductFromWishlist(User& user, int productId);
    const std::vector<int>& getWishlistProducts(const User& user);
};
