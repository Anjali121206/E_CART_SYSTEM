#include "product_repository.h"
#include "file_store.h"
#include "core/product_factory.h"
#include <sstream>
#include <algorithm>
#include <cctype>

std::vector<std::unique_ptr<Product>> ProductRepository::getAll() {
    std::vector<std::unique_ptr<Product>> out;
    for (const auto& line : FileStore::readAllLines(path)) {
        if (line.empty()) continue;
        std::istringstream iss(line);
        std::string sid, type, name, sprice, sstock, extras;
        std::getline(iss, sid, '|');
        std::getline(iss, type, '|');
        std::getline(iss, name, '|');
        std::getline(iss, sprice, '|');
        std::getline(iss, sstock, '|');
        std::getline(iss, extras, '|');
        int id = std::stoi(sid); double price = std::stod(sprice); int stock = std::stoi(sstock);
        auto created = ProductFactory::create(id, type, name, price, stock);
        if (created) out.push_back(std::move(created));
    }
    return out;
}

void ProductRepository::saveAll(const std::vector<std::unique_ptr<Product>>& items) {
    std::vector<std::string> lines;
    for (const auto& p : items) {
        // id|type|name|basePrice|stock|extras
        lines.push_back(std::to_string(p->getId()) + "|" + p->getType() + "|" + p->getName() + "|" + std::to_string(p->getBasePrice()) + "|" + std::to_string(p->getStock()) + "|");
    }
    FileStore::writeAllLinesAtomic(path, lines);
}

// Helper function to convert string to lowercase
std::string toLower(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
    return lower;
}

// Search methods implementation
std::vector<std::unique_ptr<Product>> ProductRepository::searchByName(const std::string& name) {
    auto allProducts = getAll();
    std::vector<std::unique_ptr<Product>> results;
    std::string lowerName = toLower(name);
    for (auto& product : allProducts) {
        if (toLower(product->getName()).find(lowerName) != std::string::npos) {
            results.push_back(std::move(product));
        }
    }
    return results;
}

std::vector<std::unique_ptr<Product>> ProductRepository::searchByCategory(const std::string& category) {
    auto allProducts = getAll();
    std::vector<std::unique_ptr<Product>> results;
    for (auto& product : allProducts) {
        if (product->getType() == category) {
            results.push_back(std::move(product));
        }
    }
    return results;
}

std::vector<std::unique_ptr<Product>> ProductRepository::searchByPriceRange(double minPrice, double maxPrice) {
    auto allProducts = getAll();
    std::vector<std::unique_ptr<Product>> results;
    for (auto& product : allProducts) {
        double price = product->getBasePrice();
        if (price >= minPrice && price <= maxPrice) {
            results.push_back(std::move(product));
        }
    }
    return results;
}

std::vector<std::unique_ptr<Product>> ProductRepository::combinedSearch(const std::string& name, const std::string& category, double minPrice, double maxPrice) {
    auto allProducts = getAll();
    std::vector<std::unique_ptr<Product>> results;
    std::string lowerName = toLower(name);
    bool hasNameFilter = !name.empty();
    bool hasCategoryFilter = !category.empty();
    bool hasPriceFilter = (minPrice >= 0 && maxPrice >= 0);

    for (auto& product : allProducts) {
        bool matches = true;

        if (hasNameFilter && toLower(product->getName()).find(lowerName) == std::string::npos) {
            matches = false;
        }
        if (hasCategoryFilter && product->getType() != category) {
            matches = false;
        }
        if (hasPriceFilter) {
            double price = product->getBasePrice();
            if (price < minPrice || price > maxPrice) {
                matches = false;
            }
        }

        if (matches) {
            results.push_back(std::move(product));
        }
    }
    return results;
}


