#include "order.h"
#include <sstream>
#include <iostream>

std::string Order::serialize() const {
    std::ostringstream oss;
    oss << id << '|' << userEmail << '|' << timestamp << '|'
        << subtotal << '|' << discount << '|' << tax << '|' << total << '|' << paymentMode << '|';
    
    // Serialize items
    for (size_t i = 0; i < items.size(); ++i) {
        oss << items[i].productId << ',' << items[i].quantity << ',' << items[i].unitPrice;
        if (i < items.size() - 1) {
            oss << ';';
        }
    }
    return oss.str();
}

Order Order::deserialize(const std::string& line) {
    std::istringstream iss(line);
    Order o; std::string tmp;
    std::getline(iss, o.id, '|');
    std::getline(iss, o.userEmail, '|');
    std::getline(iss, o.timestamp, '|');
    std::getline(iss, tmp, '|'); o.subtotal = std::stod(tmp.empty()?"0":tmp);
    std::getline(iss, tmp, '|'); o.discount = std::stod(tmp.empty()?"0":tmp);
    std::getline(iss, tmp, '|'); o.tax = std::stod(tmp.empty()?"0":tmp);
    std::getline(iss, tmp, '|'); o.total = std::stod(tmp.empty()?"0":tmp);
    std::getline(iss, o.paymentMode, '|');

    // Deserialize items
    std::string itemsStr;
    std::getline(iss, itemsStr);
    std::istringstream itemsIss(itemsStr);
    std::string itemToken;
    while (std::getline(itemsIss, itemToken, ';')) {
        std::istringstream itemIss(itemToken);
        std::string productIdStr, quantityStr, unitPriceStr;
        std::getline(itemIss, productIdStr, ',');
        std::getline(itemIss, quantityStr, ',');
        std::getline(itemIss, unitPriceStr, ',');
        
        try {
            int productId = std::stoi(productIdStr);
            int quantity = std::stoi(quantityStr);
            double unitPrice = std::stod(unitPriceStr);
            o.items.push_back({productId, quantity, unitPrice});
        } catch (const std::exception& e) {
            // Handle parsing error, e.g., log it or skip the item
            std::cerr << "Error deserializing CartItem: " << e.what() << std::endl;
        }
    }
    return o;
}


