#include "user.h"
#include <sstream>
#include "utils/crypto.h"

User::User(std::string u, std::string e, std::string hash, std::string r)
    : username(std::move(u)), email(std::move(e)), passwordHash(std::move(hash)), role(std::move(r)), wishlist(email) {}

void User::registerUser() {
    // Intentionally minimal: handled by repositories/UI in this project
}

bool User::login(const std::string& e, const std::string& passwordPlain) const {
    if (email != e) return false;
    return passwordHash == Crypto::hash(passwordPlain);
}

const std::string& User::getUsername() const { return username; }
const std::string& User::getEmail() const { return email; }
const std::string& User::getRole() const { return role; }

std::string User::serialize() const {
    std::ostringstream oss;
    oss << username << '|' << email << '|' << passwordHash << '|' << role << '|';
    // Serialize addresses
    for (size_t i = 0; i < addresses.size(); ++i) {
        if (i > 0) oss << ';';
        oss << addresses[i];
    }
    oss << '|' << phoneNumber << '|' << dateOfBirth;
    return oss.str();
}

User User::deserialize(const std::string& line) {
    std::istringstream iss(line);
    std::string u, e, h, r, addrStr, phone, dob;
    std::getline(iss, u, '|');
    std::getline(iss, e, '|');
    std::getline(iss, h, '|');
    std::getline(iss, r, '|');
    std::getline(iss, addrStr, '|');
    std::getline(iss, phone, '|');
    std::getline(iss, dob, '|');

    User user(u, e, h, r.empty() ? "USER" : r);
    user.setPhoneNumber(phone);
    user.setDateOfBirth(dob);

    // Deserialize addresses
    std::istringstream addrIss(addrStr);
    std::string addr;
    while (std::getline(addrIss, addr, ';')) {
        if (!addr.empty()) {
            user.addAddress(addr);
        }
    }

    return user;
}

// Wishlist management
Wishlist& User::getWishlist() { return wishlist; }
const Wishlist& User::getWishlist() const { return wishlist; }

// Profile management
void User::addAddress(const std::string& address) {
    addresses.push_back(address);
}

void User::removeAddress(size_t index) {
    if (index < addresses.size()) {
        addresses.erase(addresses.begin() + index);
    }
}

const std::vector<std::string>& User::getAddresses() const {
    return addresses;
}

void User::setPhoneNumber(const std::string& phone) {
    phoneNumber = phone;
}

const std::string& User::getPhoneNumber() const {
    return phoneNumber;
}

void User::setDateOfBirth(const std::string& dob) {
    dateOfBirth = dob;
}

const std::string& User::getDateOfBirth() const {
    return dateOfBirth;
}


