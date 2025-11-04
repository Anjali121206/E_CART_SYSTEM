#include "user_repository.h"
#include "file_store.h"

std::vector<User> UserRepository::getAll() {
    std::vector<User> users;
    for (const auto& line : FileStore::readAllLines(path)) {
        if (!line.empty()) users.push_back(User::deserialize(line));
    }
    return users;
}

void UserRepository::saveAll(const std::vector<User>& items) {
    std::vector<std::string> lines; lines.reserve(items.size());
    for (const auto& u : items) lines.push_back(u.serialize());
    FileStore::writeAllLinesAtomic(path, lines);
}


