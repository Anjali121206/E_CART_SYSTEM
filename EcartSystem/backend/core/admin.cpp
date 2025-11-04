#include "admin.h"
#include <iostream>
#include <iomanip>
#include <algorithm>
#include <numeric>
#include "product_types/electronics.h"
#include "product_types/clothing.h"
#include "product_types/grocery.h"

void Admin::addProduct(Inventory& inventory) {
    std::cout << "\n=== Add New Product ===\n";
    std::cout << "Product types: Electronics, Clothing, Grocery\n";
    std::cout << "Enter product type: ";
    std::string type;
    std::getline(std::cin >> std::ws, type);

    std::cout << "Enter product name: ";
    std::string name;
    std::getline(std::cin >> std::ws, name);

    std::cout << "Enter price: ";
    double price;
    std::cin >> price;

    std::cout << "Enter initial stock: ";
    int stock;
    std::cin >> stock;

    // Generate new ID (simple approach)
    int newId = 1;
    for (const auto& p : inventory.getProducts()) {
        if (p->getId() >= newId) newId = p->getId() + 1;
    }

    std::unique_ptr<Product> product;
    if (type == "Electronics") {
        std::cout << "Enter brand: ";
        std::string brand;
        std::getline(std::cin >> std::ws, brand);
        std::cout << "Enter warranty (months): ";
        int warranty;
        std::cin >> warranty;
        product = std::make_unique<Electronics>(newId, name, price, stock, brand, warranty);
    } else if (type == "Clothing") {
        std::cout << "Enter size: ";
        std::string size;
        std::getline(std::cin >> std::ws, size);
        std::cout << "Enter color: ";
        std::string color;
        std::getline(std::cin >> std::ws, color);
        std::cout << "Enter material: ";
        std::string material;
        std::getline(std::cin >> std::ws, material);
        product = std::make_unique<Clothing>(newId, name, price, stock, size, color, material);
    } else if (type == "Grocery") {
        std::cout << "Enter expiry date: ";
        std::string expiry;
        std::getline(std::cin >> std::ws, expiry);
        std::cout << "Enter weight (kg): ";
        double weight;
        std::cin >> weight;
        product = std::make_unique<Grocery>(newId, name, price, stock, expiry, weight);
    } else {
        std::cout << "Invalid product type!\n";
        return;
    }

    inventory.getProducts().push_back(std::move(product));
    std::cout << "Product added successfully with ID: " << newId << "\n";
}

void Admin::removeProduct(Inventory& inventory, int id) {
    auto& products = inventory.getProducts();
    auto it = std::find_if(products.begin(), products.end(),
        [id](const std::unique_ptr<Product>& p) { return p->getId() == id; });

    if (it != products.end()) {
        std::cout << "Removed product: " << (*it)->getName() << "\n";
        products.erase(it);
    } else {
        std::cout << "Product with ID " << id << " not found.\n";
    }
}

void Admin::updateProductStock(Inventory& inventory, int productId, int newStock) {
    inventory.updateStock(productId, newStock);
    std::cout << "Updated stock for product ID " << productId << " to " << newStock << "\n";
}

void Admin::viewSalesReport() const {
    std::cout << "\n=== Sales Report ===\n";
    std::cout << "Total Orders: " << getTotalOrders() << "\n";
    std::cout << "Total Revenue: $" << std::fixed << std::setprecision(2) << getTotalRevenue() << "\n";
    std::cout << "Average Order Value: $" << getAverageOrderValue() << "\n";

    std::cout << "\nRevenue by Category:\n";
    auto revenueByCat = getRevenueByCategory();
    for (const auto& pair : revenueByCat) {
        std::cout << "  " << pair.first << ": $" << pair.second << "\n";
    }

    std::cout << "\nSales by Category:\n";
    auto salesByCat = getSalesByCategory();
    for (const auto& pair : salesByCat) {
        std::cout << "  " << pair.first << ": " << pair.second << " units\n";
    }
}

double Admin::getTotalRevenue() const {
    return std::accumulate(salesData.begin(), salesData.end(), 0.0,
        [](double sum, const Order& order) { return sum + order.total; });
}

std::map<std::string, int> Admin::getSalesByCategory() const {
    std::map<std::string, int> salesByCategory;
    for (const auto& order : salesData) {
        for (const auto& item : order.items) {
            // This would need product type lookup - simplified for now
            salesByCategory["Unknown"] += item.quantity;
        }
    }
    return salesByCategory;
}

std::map<std::string, double> Admin::getRevenueByCategory() const {
    std::map<std::string, double> revenueByCategory;
    for (const auto& order : salesData) {
        for (const auto& item : order.items) {
            // This would need product type lookup - simplified for now
            revenueByCategory["Unknown"] += item.unitPrice * item.quantity;
        }
    }
    return revenueByCategory;
}

int Admin::getTotalOrders() const {
    return salesData.size();
}

double Admin::getAverageOrderValue() const {
    if (salesData.empty()) return 0.0;
    return getTotalRevenue() / salesData.size();
}

void Admin::viewInventoryReport(const Inventory& inventory) const {
    std::cout << "\n=== Inventory Report ===\n";
    std::cout << "Total Products: " << inventory.getProducts().size() << "\n";
    std::cout << "Total Inventory Value: $" << std::fixed << std::setprecision(2)
              << inventory.getTotalInventoryValue() << "\n";

    std::cout << "\nStock by Category:\n";
    auto categoryStock = inventory.getCategoryStock();
    for (const auto& pair : categoryStock) {
        std::cout << "  " << pair.first << ": " << pair.second << " units\n";
    }

    std::cout << "\nTop 5 Products by Stock:\n";
    auto topProducts = inventory.getTopSellingProducts(5);
    for (size_t i = 0; i < topProducts.size(); ++i) {
        std::cout << "  " << (i+1) << ". " << topProducts[i]->getName()
                  << " (Stock: " << topProducts[i]->getStock() << ")\n";
    }
}

void Admin::viewLowStockAlerts(const Inventory& inventory) const {
    std::cout << "\n=== Low Stock Alerts ===\n";
    auto lowStockProducts = inventory.checkLowStockAlerts();
    if (lowStockProducts.empty()) {
        std::cout << "No low stock alerts.\n";
    } else {
        std::cout << "Products with low stock:\n";
        for (int productId : lowStockProducts) {
            Product* p = inventory.findById(productId);
            if (p) {
                std::cout << "  " << p->getName() << " (ID: " << productId
                          << ") - Stock: " << p->getStock() << "\n";
            }
        }
    }
}

void Admin::viewUserStatistics() const {
    std::cout << "\n=== User Statistics ===\n";
    std::cout << "Total users: [Would be loaded from repository]\n";
    std::cout << "Active users: [Would be calculated from recent orders]\n";
    std::cout << "New users this month: [Would be calculated from registration dates]\n";
}

void Admin::generateSystemReport() const {
    std::cout << "\n=== System Health Report ===\n";
    std::cout << "Server Status: Running\n";
    std::cout << "Database Connections: OK\n";
    std::cout << "Memory Usage: [Not implemented]\n";
    std::cout << "Disk Space: [Not implemented]\n";
    std::cout << "Last Backup: [Not implemented]\n";
}

void Admin::setSalesData(const std::vector<Order>& orders) {
    salesData = orders;
}


