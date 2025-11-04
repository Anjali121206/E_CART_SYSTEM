#pragma once
#include <string>
#include <utility>

// Strategy for providing rider location strings
class RiderLocationStrategy {
public:
    virtual ~RiderLocationStrategy() = default;
    virtual std::string nextLocation() = 0; // e.g., "Lat,Lng|timestamp"
};

class TextPathStrategy : public RiderLocationStrategy {
    int step{0};
public:
    std::string nextLocation() override;
};


