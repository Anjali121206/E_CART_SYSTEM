#include "inventory.h"
#include <algorithm>
#include <numeric>

Product* Inventory::findById(int id) const {
    for (const auto& p : products) if (p->getId() == id) return p.get();
    return nullptr;
}

std::vector<Product*> Inventory::searchByName(const std::string& q) const {
    std::vector<Product*> out;
    for (const auto& p : products) {
        if (p->getName().find(q) != std::string::npos) out.push_back(p.get());
    }
    return out;
}

// Enhanced inventory management
void Inventory::setLowStockThreshold(int threshold) {
    lowStockThreshold = threshold;
}

void Inventory::addLowStockAlert(int productId, int threshold) {
    lowStockAlerts[productId] = threshold;
}

void Inventory::removeLowStockAlert(int productId) {
    lowStockAlerts.erase(productId);
}

std::vector<int> Inventory::checkLowStockAlerts() const {
    std::vector<int> lowStockProducts;
    for (const auto& p : products) {
        int threshold = lowStockAlerts.count(p->getId()) ? lowStockAlerts.at(p->getId()) : lowStockThreshold;
        if (p->getStock() <= threshold) {
            lowStockProducts.push_back(p->getId());
        }
    }
    return lowStockProducts;
}

void Inventory::restockProduct(int productId, int quantity) {
    Product* p = findById(productId);
    if (p) {
        int newStock = p->getStock() + quantity;
        p->setStock(newStock);
        // Check if stock was low and now sufficient
        if (newStock > lowStockThreshold) {
            // Could notify that stock is back to normal
        }
    }
}

void Inventory::updateStock(int productId, int newStock) {
    Product* p = findById(productId);
    if (p) {
        int oldStock = p->getStock();
        p->setStock(newStock);

        // Check for low stock alerts
        int threshold = lowStockAlerts.count(productId) ? lowStockAlerts.at(productId) : lowStockThreshold;
        if (newStock <= threshold && oldStock > threshold) {
            notifyLowStock(productId, newStock);
        }
    }
}

// Analytics
double Inventory::getTotalInventoryValue() const {
    return std::accumulate(products.begin(), products.end(), 0.0,
        [](double sum, const std::unique_ptr<Product>& p) {
            return sum + (p->getPrice() * p->getStock());
        });
}

std::map<std::string, int> Inventory::getCategoryStock() const {
    std::map<std::string, int> categoryStock;
    for (const auto& p : products) {
        categoryStock[p->getType()] += p->getStock();
    }
    return categoryStock;
}

std::vector<Product*> Inventory::getTopSellingProducts(int limit) const {
    // This would require sales data integration
    // For now, return products sorted by stock (assuming higher stock = more popular)
    std::vector<Product*> sortedProducts;
    for (const auto& p : products) {
        sortedProducts.push_back(p.get());
    }
    std::sort(sortedProducts.begin(), sortedProducts.end(),
        [](Product* a, Product* b) { return a->getStock() > b->getStock(); });
    if (sortedProducts.size() > static_cast<size_t>(limit)) {
        sortedProducts.resize(limit);
    }
    return sortedProducts;
}

// Notifications
void Inventory::subscribeToNotifications(std::unique_ptr<NotificationObserver> observer) {
    notificationManager.subscribe(std::move(observer));
}

void Inventory::notifyLowStock(int productId, int currentStock) {
    Product* p = findById(productId);
    if (p) {
        std::string message = "Low stock alert: " + p->getName() +
                            " (ID: " + std::to_string(productId) +
                            ") has only " + std::to_string(currentStock) + " units remaining.";
        notificationManager.sendNotification(message);
    }
}

void Inventory::addProduct(Product* p) {
    products.emplace_back(p);
}

bool Inventory::removeProduct(int id) {
    auto it = std::remove_if(products.begin(), products.end(), [id](const std::unique_ptr<Product>& p) {
        return p->getId() == id;
    });
    if (it != products.end()) {
        products.erase(it, products.end());
        return true;
    }
    return false;
}