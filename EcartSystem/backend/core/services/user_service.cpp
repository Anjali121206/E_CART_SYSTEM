#include "user_service.h"

UserService::UserService(UserRepository& repo)
    : userRepository(repo) {}

bool UserService::registerUser(const std::string& username, const std::string& email) {
    auto users = userRepository.getAll();
    for (const auto& u : users) {
        if (u.getEmail() == email) {
            return false; // User already exists
        }
    }
    users.emplace_back(username, email);
    userRepository.saveAll(users);
    return true;
}

User* UserService::loginUser(const std::string& email) {
    auto users = userRepository.getAll();
    for (auto& u : users) {
        if (u.getEmail() == email) {
            return &u;
        }
    }
    return nullptr;
}

std::string UserService::getUserRole(const std::string& email) {
    User* user = loginUser(email);
    if (user) {
        return user->getRole();
    }
    return "USER"; // Default role
}
