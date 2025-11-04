#pragma once
#include <string>
#include <vector>

class Review {
protected:
    int id;
    int productId;
    std::string userEmail;
    std::string timestamp;
public:
    Review(int id, int productId, std::string userEmail, std::string timestamp);
    virtual ~Review() = default;
    virtual void display() const = 0;
    virtual std::string serialize() const = 0;
    virtual void deserialize(const std::string& data) = 0;
    int getId() const;
    int getProductId() const;
    const std::string& getUserEmail() const;
    const std::string& getTimestamp() const;
};

class TextReview : public Review {
private:
    std::string text;
    int rating; // 1-5 stars
public:
    TextReview(int id, int productId, std::string userEmail, std::string timestamp, std::string text, int rating);
    void display() const override;
    std::string serialize() const override;
    void deserialize(const std::string& data) override;
    const std::string& getText() const;
    int getRating() const;
};

class RatingReview : public Review {
private:
    int rating; // 1-5 stars
public:
    RatingReview(int id, int productId, std::string userEmail, std::string timestamp, int rating);
    void display() const override;
    std::string serialize() const override;
    void deserialize(const std::string& data) override;
    int getRating() const;
};
