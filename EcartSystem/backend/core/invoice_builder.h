#pragma once
#include <string>
#include <vector>
#include "order.h"
#include "inventory.h"

// Builder Pattern for invoice rendering
class InvoiceBuilder {
    const Order& order;
    const Inventory& inventory;
    std::string header;
    std::string lines;
    std::string footer;
public:
    InvoiceBuilder(const Order& o, const Inventory& inv) : order(o), inventory(inv) {}
    InvoiceBuilder& buildHeader();
    InvoiceBuilder& buildLines();
    InvoiceBuilder& buildFooter();
    std::string str() const { return header + lines + footer; }
};


