#include "logger.h"
#include <iostream>

void Logger::log(Level level, const std::string& msg) {
    const char* p = level == INFO ? "INFO" : level == WARN ? "WARN" : "ERROR";
    std::cout << '[' << p << "] " << msg << '\n';
}


