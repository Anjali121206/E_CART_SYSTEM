#pragma once
#include <string>

class Logger {
public:
    enum Level { INFO, WARN, ERROR };
    static void log(Level level, const std::string& msg);
};


