#pragma once
#include "repository.h"
#include "core/product.h"
#include <memory>
#include <vector>
#include <string>

// Abstraction for product repository (Interface)
class IProductRepository {
public:
    virtual ~IProductRepository() = default;
    virtual std::vector<std::unique_ptr<Product>> getAll() = 0;
    virtual void saveAll(const std::vector<std::unique_ptr<Product>>& items) = 0;
    virtual std::vector<std::unique_ptr<Product>> searchByName(const std::string& name) = 0;
    virtual std::vector<std::unique_ptr<Product>> searchByCategory(const std::string& category) = 0;
    virtual std::vector<std::unique_ptr<Product>> searchByPriceRange(double minPrice, double maxPrice) = 0;
    virtual std::vector<std::unique_ptr<Product>> combinedSearch(const std::string& name, const std::string& category, double minPrice, double maxPrice) = 0;
};

class ProductRepository : public IProductRepository {
    std::string path;
public:
    explicit ProductRepository(std::string p) : path(std::move(p)) {}
    std::vector<std::unique_ptr<Product>> getAll() override;
    void saveAll(const std::vector<std::unique_ptr<Product>>& items) override;

    // Search methods
    std::vector<std::unique_ptr<Product>> searchByName(const std::string& name) override;
    std::vector<std::unique_ptr<Product>> searchByCategory(const std::string& category) override;
    std::vector<std::unique_ptr<Product>> searchByPriceRange(double minPrice, double maxPrice) override;
    std::vector<std::unique_ptr<Product>> combinedSearch(const std::string& name, const std::string& category, double minPrice, double maxPrice) override;
};


