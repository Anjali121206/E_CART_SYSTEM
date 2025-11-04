#include "order_status.h"

std::unique_ptr<OrderState> PlacedState::next() const { return std::make_unique<PackedState>(); }
std::unique_ptr<OrderState> PackedState::next() const { return std::make_unique<OutForDeliveryState>(); }
std::unique_ptr<OrderState> OutForDeliveryState::next() const { return std::make_unique<DeliveredState>(); }


