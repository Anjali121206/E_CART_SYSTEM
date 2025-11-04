#pragma once
#include <string>
#include <vector>

class Delivery {
private:
    std::string selectedSlot;
    std::string status;
    int estimatedMinutes;
    std::vector<std::string> availableSlots;
public:
    Delivery();
    bool selectSlot(const std::string& slot);
    void updateStatus(const std::string& newStatus);
    std::string getSelectedSlot() const { return selectedSlot; }
    std::string getStatus() const { return status; }
    int getEstimatedMinutes() const { return estimatedMinutes; }
    const std::vector<std::string>& getAvailableSlots() const { return availableSlots; }
    void randomizeEstimate();
};
