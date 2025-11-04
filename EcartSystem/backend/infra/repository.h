#pragma once
#include <vector>

template<typename T>
class Repository {
public:
    virtual ~Repository() = default;
    virtual std::vector<T> getAll() = 0;
    virtual void saveAll(const std::vector<T>& items) = 0;
};


