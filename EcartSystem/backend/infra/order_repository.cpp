#include "order_repository.h"
#include "file_store.h"

std::vector<Order> OrderRepository::getAll() {
    std::vector<Order> out;
    for (const auto& line : FileStore::readAllLines(path)) {
        if (!line.empty()) out.push_back(Order::deserialize(line));
    }
    return out;
}

void OrderRepository::saveAll(const std::vector<Order>& items) {
    std::vector<std::string> lines; lines.reserve(items.size());
    for (const auto& o : items) lines.push_back(o.serialize());
    FileStore::writeAllLinesAtomic(path, lines);
}

void OrderRepository::append(const Order& order) {
    FileStore::appendLine(path, order.serialize());
}


