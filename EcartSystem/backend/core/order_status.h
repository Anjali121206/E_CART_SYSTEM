#pragma once
#include <string>
#include <memory>

// State Pattern for order lifecycle
class OrderState {
public:
    virtual ~OrderState() = default;
    virtual std::string name() const = 0;
    virtual std::unique_ptr<OrderState> next() const = 0;
};

class PlacedState : public OrderState {
public:
    std::string name() const override { return "Placed"; }
    std::unique_ptr<OrderState> next() const override;
};

class PackedState : public OrderState {
public:
    std::string name() const override { return "Packed"; }
    std::unique_ptr<OrderState> next() const override;
};

class OutForDeliveryState : public OrderState {
public:
    std::string name() const override { return "Out for delivery"; }
    std::unique_ptr<OrderState> next() const override;
};

class DeliveredState : public OrderState {
public:
    std::string name() const override { return "Delivered"; }
    std::unique_ptr<OrderState> next() const override { return nullptr; }
};


