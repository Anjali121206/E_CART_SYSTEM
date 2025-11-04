#pragma once
#include "repository.h"
#include "core/user.h"
#include <string>

class UserRepository : public Repository<User> {
    std::string path;
public:
    explicit UserRepository(std::string p) : path(std::move(p)) {}
    std::vector<User> getAll() override;
    void saveAll(const std::vector<User>& items) override;
};


