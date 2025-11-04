#include "invoice_builder.h"
#include <sstream>

InvoiceBuilder& InvoiceBuilder::buildHeader() {
    std::ostringstream oss;
    oss << "========================================\n"
        << "         E-CART INVOICE\n"
        << "========================================\n"
        << "Customer: " << order.userEmail << "\nItems:\n";
    header = oss.str();
    return *this;
}

InvoiceBuilder& InvoiceBuilder::buildLines() {
    std::ostringstream oss;
    for (const auto& it : order.items) {
        auto* p = inventory.findById(it.productId);
        std::string nm = p ? p->getName() : std::to_string(it.productId);
        oss << nm << "  - Rs. " << it.unitPrice << " x" << it.quantity << "\n";
    }
    lines = oss.str();
    return *this;
}

InvoiceBuilder& InvoiceBuilder::buildFooter() {
    std::ostringstream oss;
    oss << "----------------------------------------\n"
        << "Subtotal: Rs. " << order.subtotal << "\n"
        << "Discount: Rs. " << order.discount << "\n"
        << "Tax (5%): Rs. " << order.tax << "\n"
        << "----------------------------------------\n"
        << "Total: Rs. " << order.total << "\n"
        << "Payment Mode: " << order.paymentMode << "\n"
        << "----------------------------------------\n"
        << "Thank you for shopping with us!\n";
    footer = oss.str();
    return *this;
}


