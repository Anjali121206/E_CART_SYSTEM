#include "review.h"
#include <iostream>
#include <sstream>

Review::Review(int id, int productId, std::string userEmail, std::string timestamp)
    : id(id), productId(productId), userEmail(std::move(userEmail)), timestamp(std::move(timestamp)) {}

int Review::getId() const { return id; }
int Review::getProductId() const { return productId; }
const std::string& Review::getUserEmail() const { return userEmail; }
const std::string& Review::getTimestamp() const { return timestamp; }

// TextReview implementation
TextReview::TextReview(int id, int productId, std::string userEmail, std::string timestamp, std::string text, int rating)
    : Review(id, productId, std::move(userEmail), std::move(timestamp)), text(std::move(text)), rating(rating) {}

void TextReview::display() const {
    std::cout << "Review by " << userEmail << " (" << timestamp << "): " << rating << "/5 stars\n";
    std::cout << "\"" << text << "\"\n";
}

std::string TextReview::serialize() const {
    std::ostringstream oss;
    oss << id << "," << productId << "," << userEmail << "," << timestamp << "," << rating << "," << text;
    return oss.str();
}

void TextReview::deserialize(const std::string& data) {
    std::istringstream iss(data);
    std::string token;
    std::getline(iss, token, ','); id = std::stoi(token);
    std::getline(iss, token, ','); productId = std::stoi(token);
    std::getline(iss, userEmail, ',');
    std::getline(iss, timestamp, ',');
    std::getline(iss, token, ','); rating = std::stoi(token);
    std::getline(iss, text);
}

const std::string& TextReview::getText() const { return text; }
int TextReview::getRating() const { return rating; }

// RatingReview implementation
RatingReview::RatingReview(int id, int productId, std::string userEmail, std::string timestamp, int rating)
    : Review(id, productId, std::move(userEmail), std::move(timestamp)), rating(rating) {}

void RatingReview::display() const {
    std::cout << "Rating by " << userEmail << " (" << timestamp << "): " << rating << "/5 stars\n";
}

std::string RatingReview::serialize() const {
    std::ostringstream oss;
    oss << id << "," << productId << "," << userEmail << "," << timestamp << "," << rating;
    return oss.str();
}

void RatingReview::deserialize(const std::string& data) {
    std::istringstream iss(data);
    std::string token;
    std::getline(iss, token, ','); id = std::stoi(token);
    std::getline(iss, token, ','); productId = std::stoi(token);
    std::getline(iss, userEmail, ',');
    std::getline(iss, timestamp, ',');
    std::getline(iss, token); rating = std::stoi(token);
}

int RatingReview::getRating() const { return rating; }
