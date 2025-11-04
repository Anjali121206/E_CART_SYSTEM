#pragma once

#include "../inventory.h"
#include "../product.h"
#include "../../infra/product_repository.h"

class ProductService {
private:
    Inventory& inventory;
    IProductRepository& productRepository;

public:
    ProductService(Inventory& inv, IProductRepository& repo);

    std::vector<Product*> getAllProducts();
    Product* getProductById(int id);
    void addProduct(const std::string& type, const std::string& name, double price, int stock);
    bool updateProduct(int id, const std::string& type, const std::string& name, double price, int stock);
    bool deleteProduct(int id);
};
