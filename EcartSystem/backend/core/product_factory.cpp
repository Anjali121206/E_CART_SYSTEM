#include "product_factory.h"
#include "product_types/electronics.h"
#include "product_types/clothing.h"
#include "product_types/grocery.h"
#include "product_types/snack.h"
#include "product_types/beverage.h"
#include "product_types/dairy.h"

std::unique_ptr<Product> ProductFactory::create(int id, const std::string& type, const std::string& name, double price, int stock){
    if (type == "Electronics") return std::make_unique<Electronics>(id, name, price, stock, "Brand", 12);
    if (type == "Clothing") return std::make_unique<Clothing>(id, name, price, stock, "M", "Blue", "Cotton");
    if (type == "Grocery") return std::make_unique<Grocery>(id, name, price, stock, "2026-12-31", 1.0);
    if (type == "Snack") return std::make_unique<Snack>(id, name, price, stock, "2026-12-31", "Snacks", 4.5);
    if (type == "Beverage") return std::make_unique<Beverage>(id, name, price, stock, "2026-12-31", "Beverages", 4.2);
    if (type == "Dairy") return std::make_unique<Dairy>(id, name, price, stock, "2026-12-31", "Dairy", 4.8);
    return nullptr;
}


