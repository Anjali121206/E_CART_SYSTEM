#pragma once
#include <string>

class Observer {
public:
    virtual ~Observer() = default;
    virtual void onEvent(const std::string& topic, const std::string& payload) = 0;
};

class Subject {
public:
    virtual ~Subject() = default;
    virtual void attach(Observer* obs) = 0;
    virtual void detach(Observer* obs) = 0;
    virtual void notify(const std::string& topic, const std::string& payload) = 0;
};


