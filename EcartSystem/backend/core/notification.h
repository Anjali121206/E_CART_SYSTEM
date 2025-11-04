#pragma once
#include <string>
#include <vector>
#include <memory>

// Observer Pattern for Notifications
class NotificationObserver {
public:
    virtual ~NotificationObserver() = default;
    virtual void update(const std::string& message) = 0;
    virtual std::string getIdentifier() const = 0;
};

class NotificationSubject {
private:
    std::vector<std::unique_ptr<NotificationObserver>> observers;
public:
    void attach(std::unique_ptr<NotificationObserver> observer);
    void detach(const std::string& identifier);
    void notify(const std::string& message);
};

class EmailNotification : public NotificationObserver {
private:
    std::string email;
public:
    explicit EmailNotification(std::string emailAddr) : email(std::move(emailAddr)) {}
    void update(const std::string& message) override;
    std::string getIdentifier() const override;
};

class SMSNotification : public NotificationObserver {
private:
    std::string phoneNumber;
public:
    explicit SMSNotification(std::string phone) : phoneNumber(std::move(phone)) {}
    void update(const std::string& message) override;
    std::string getIdentifier() const override;
};

class NotificationManager {
private:
    NotificationSubject subject;
public:
    void subscribe(std::unique_ptr<NotificationObserver> observer);
    void unsubscribe(const std::string& identifier);
    void sendNotification(const std::string& message);
};
