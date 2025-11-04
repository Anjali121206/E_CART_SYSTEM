#include "tracker.h"
#include <algorithm>

OrderTracker::OrderTracker() : state(std::make_unique<PlacedState>()) {}

bool OrderTracker::advance() {
    if (!state) return false;
    auto nextState = state->next();
    if (!nextState) return false;
    state = std::move(nextState);
    notify("order.status", current());
    return true;
}

void OrderTracker::detach(Observer* obs) {
    auto it = std::find(observers.begin(), observers.end(), obs);
    if (it != observers.end()) {
        observers.erase(it);
    }
}

void OrderTracker::notify(const std::string& topic, const std::string& payload) {
    for (auto* o : observers) if (o) o->onEvent(topic, payload);
}


