#pragma once
#include <memory>
#include <vector>
#include <string>
#include <map>
#include "product.h"
#include "notification.h"

class Inventory {
private:
    std::vector<std::unique_ptr<Product>> products;
    std::map<int, int> lowStockAlerts; // productId -> threshold
    NotificationManager notificationManager;
    int lowStockThreshold = 5; // Default threshold

public:
    // Existing methods
    Product* findById(int id) const;
    std::vector<Product*> searchByName(const std::string& q) const;

    // Enhanced inventory management
    void setLowStockThreshold(int threshold);
    void addLowStockAlert(int productId, int threshold);
    void removeLowStockAlert(int productId);
    std::vector<int> checkLowStockAlerts() const;
    void restockProduct(int productId, int quantity);
    void updateStock(int productId, int newStock);

    // Analytics
    double getTotalInventoryValue() const;
    std::map<std::string, int> getCategoryStock() const;
    std::vector<Product*> getTopSellingProducts(int limit = 10) const;

    // Notifications
    void subscribeToNotifications(std::unique_ptr<NotificationObserver> observer);
    void notifyLowStock(int productId, int currentStock);

    // Access to products
    const std::vector<std::unique_ptr<Product>>& getProducts() const { return products; }
    std::vector<std::unique_ptr<Product>>& getProducts() { return products; }

    void addProduct(Product* p);
    bool removeProduct(int id);
};


