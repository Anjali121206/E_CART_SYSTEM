#include "notification.h"
#include <iostream>
#include <algorithm>

// NotificationSubject implementation
void NotificationSubject::attach(std::unique_ptr<NotificationObserver> observer) {
    observers.push_back(std::move(observer));
}

void NotificationSubject::detach(const std::string& identifier) {
    observers.erase(
        std::remove_if(observers.begin(), observers.end(),
            [&identifier](const std::unique_ptr<NotificationObserver>& obs) {
                return obs->getIdentifier() == identifier;
            }),
        observers.end()
    );
}

void NotificationSubject::notify(const std::string& message) {
    for (const auto& observer : observers) {
        observer->update(message);
    }
}

// EmailNotification implementation
void EmailNotification::update(const std::string& message) {
    std::cout << "[EMAIL to " << email << "] " << message << std::endl;
    // In a real system, this would send an actual email
}

std::string EmailNotification::getIdentifier() const {
    return "email:" + email;
}

// SMSNotification implementation
void SMSNotification::update(const std::string& message) {
    std::cout << "[SMS to " << phoneNumber << "] " << message << std::endl;
    // In a real system, this would send an actual SMS
}

std::string SMSNotification::getIdentifier() const {
    return "sms:" + phoneNumber;
}

// NotificationManager implementation
void NotificationManager::subscribe(std::unique_ptr<NotificationObserver> observer) {
    subject.attach(std::move(observer));
}

void NotificationManager::unsubscribe(const std::string& identifier) {
    subject.detach(identifier);
}

void NotificationManager::sendNotification(const std::string& message) {
    subject.notify(message);
}
