#include "delivery.h"
#include <algorithm>
#include <cstdlib>
#include <ctime>

Delivery::Delivery() : status("Not scheduled"), estimatedMinutes(0) {
    availableSlots = {
        "10:00 AM - 12:00 PM",
        "12:00 PM - 2:00 PM",
        "2:00 PM - 4:00 PM",
        "4:00 PM - 6:00 PM",
        "6:00 PM - 8:00 PM",
        "8:00 PM - 10:00 PM"
    };
    std::srand(std::time(nullptr));
    randomizeEstimate();
}

bool Delivery::selectSlot(const std::string& slot) {
    if (std::find(availableSlots.begin(), availableSlots.end(), slot) != availableSlots.end()) {
        selectedSlot = slot;
        status = "Scheduled";
        randomizeEstimate();
        return true;
    }
    return false;
}

void Delivery::updateStatus(const std::string& newStatus) {
    status = newStatus;
    if (status == "Out for delivery") {
        randomizeEstimate();
    }
}

void Delivery::randomizeEstimate() {
    estimatedMinutes = 10 + (std::rand() % 11); // 10-20 minutes
}
