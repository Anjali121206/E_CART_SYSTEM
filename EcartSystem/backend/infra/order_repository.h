#pragma once
#include "repository.h"
#include "core/order.h"
#include <string>

class OrderRepository : public Repository<Order> {
    std::string path;
public:
    explicit OrderRepository(std::string p) : path(std::move(p)) {}
    std::vector<Order> getAll() override;
    void saveAll(const std::vector<Order>& items) override;
    void append(const Order& order);
};


