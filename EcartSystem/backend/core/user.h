#pragma once
#include <string>
#include <vector>
#include "wishlist.h"

class User {
private:
    std::string username;
    std::string email;
    std::string passwordHash;
    std::string role; // USER or ADMIN
    Wishlist wishlist;
    std::vector<std::string> addresses;
    std::string phoneNumber;
    std::string dateOfBirth;
public:
    User(std::string u = "", std::string e = "", std::string hash = "", std::string r = "USER");
    void registerUser();
    bool login(const std::string& e, const std::string& passwordPlain) const;
    const std::string& getUsername() const;
    const std::string& getEmail() const;
    const std::string& getRole() const;
    std::string serialize() const;
    static User deserialize(const std::string& line);

    // Wishlist management
    Wishlist& getWishlist();
    const Wishlist& getWishlist() const;

    // Profile management
    void addAddress(const std::string& address);
    void removeAddress(size_t index);
    const std::vector<std::string>& getAddresses() const;
    void setPhoneNumber(const std::string& phone);
    const std::string& getPhoneNumber() const;
    void setDateOfBirth(const std::string& dob);
    const std::string& getDateOfBirth() const;
};


