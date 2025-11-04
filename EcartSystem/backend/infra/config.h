#pragma once
#include <string>

struct ConfigPaths {
    std::string users = "../data/users.txt";
    std::string products = "../data/products.txt";
    std::string orders = "../data/orders.txt";
    std::string sales = "../data/sales.txt";
    std::string config = "../data/config.json";
};

class Config {
    ConfigPaths paths;
public:
    void loadDefaultPaths();
    ConfigPaths& get() { return paths; }
    const ConfigPaths& get() const { return paths; }
};


