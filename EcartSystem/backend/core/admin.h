#pragma once
#include "user.h"
#include <memory>
#include <vector>
#include <map>
#include <string>
#include "product.h"
#include "inventory.h"
#include "order.h"

class Admin : public User {
private:
    std::vector<Order> salesData; // Would be loaded from repository

public:
    using User::User;

    // Product management
    void addProduct(Inventory& inventory);
    void removeProduct(Inventory& inventory, int id);
    void updateProductStock(Inventory& inventory, int productId, int newStock);

    // Analytics and reporting
    void viewSalesReport() const;
    double getTotalRevenue() const;
    std::map<std::string, int> getSalesByCategory() const;
    std::map<std::string, double> getRevenueByCategory() const;
    int getTotalOrders() const;
    double getAverageOrderValue() const;

    // Inventory analytics
    void viewInventoryReport(const Inventory& inventory) const;
    void viewLowStockAlerts(const Inventory& inventory) const;

    // User management
    void viewUserStatistics() const;

    // System health
    void generateSystemReport() const;

    // Data management
    void setSalesData(const std::vector<Order>& orders);
};


