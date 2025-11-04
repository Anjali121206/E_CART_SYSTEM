#pragma once
#include <memory>
#include <vector>
#include <string>
#include <utility>
#include "order_status.h"
#include "observer.h"

// Tracks an order's state and notifies observers
class OrderTracker : public Subject {
    std::unique_ptr<OrderState> state;
    std::vector<Observer*> observers;
public:
    OrderTracker();
    const std::string current() const { return state ? state->name() : ""; }
    bool advance(); // returns false if already delivered
    void attach(Observer* obs) override { observers.push_back(obs); }
    void detach(Observer* obs) override;
    void notify(const std::string& topic, const std::string& payload) override;
};


