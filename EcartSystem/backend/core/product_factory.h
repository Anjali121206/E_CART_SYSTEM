#pragma once
#include "product.h"
#include <memory>
#include <string>

class ProductFactory {
public:
    static std::unique_ptr<Product> create(int id, const std::string& type, const std::string& name, double price, int stock);
};


