#pragma once

#include "../../infra/user_repository.h"
#include "../user.h"
#include <string>

class UserService {
private:
    UserRepository& userRepository;

public:
    UserService(UserRepository& repo);

    bool registerUser(const std::string& username, const std::string& email);
    User* loginUser(const std::string& email);
    std::string getUserRole(const std::string& email);
};
