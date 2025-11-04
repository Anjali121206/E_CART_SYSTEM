#include "rider_simulator.h"
#include <sstream>
#include <vector>

std::string TextPathStrategy::nextLocation() {
    // simple route simulation as text waypoints
    static const std::vector<std::string> pts = {"Warehouse","Highway","City Center","Near You","Delivered"};
    const int n = pts.size();
    const std::string& where = pts[step < n ? step : n-1];
    ++step;
    std::ostringstream oss; oss << where; return oss.str();
}


