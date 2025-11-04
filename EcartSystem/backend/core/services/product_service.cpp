#include "product_service.h"
#include "../product_types/clothing.h"
#include "../product_types/electronics.h"
#include "../product_types/grocery.h"
#include "../product_factory.h"

ProductService::ProductService(Inventory& inv, IProductRepository& repo)
    : inventory(inv), productRepository(repo) {}

std::vector<Product*> ProductService::getAllProducts() {
    std::vector<Product*> product_pointers;
    for (const auto& p : inventory.getProducts()) {
        product_pointers.push_back(p.get());
    }
    return product_pointers;
}

Product* ProductService::getProductById(int id) {
    return inventory.findById(id);
}

void ProductService::addProduct(const std::string& type, const std::string& name, double price, int stock) {
    int nextId = 1;
    for (const auto& existing : inventory.getProducts()) {
        nextId = std::max(nextId, existing->getId() + 1);
    }
    auto created = ProductFactory::create(nextId, type, name, price, stock);
    if (created) {
        inventory.addProduct(created.release());
        productRepository.saveAll(inventory.getProducts());
    }
}

bool ProductService::updateProduct(int id, const std::string& type, const std::string& name, double price, int stock) {
    Product* p = inventory.findById(id);
    if (p) {
        p->setStock(stock);
        // Type change is more complex, skipping for now.
        // Name and price are not mutable in the current design.
        productRepository.saveAll(inventory.getProducts());
        return true;
    }
    return false;
}

bool ProductService::deleteProduct(int id) {
    bool deleted = inventory.removeProduct(id);
    if (deleted) {
        productRepository.saveAll(inventory.getProducts());
    }
    return deleted;
}
