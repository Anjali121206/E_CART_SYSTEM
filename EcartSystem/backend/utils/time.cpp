#include "time.h"
#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

std::string TimeUtil::nowIso() {
    auto t = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    std::tm tm{};
#if defined(_WIN32)
    tm = *localtime(&t);
#else
    localtime_r(&t, &tm);
#endif
    std::ostringstream oss; oss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%S");
    return oss.str();
}

std::string TimeUtil::nowCompact() {
    auto t = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    std::tm tm{};
#if defined(_WIN32)
    tm = *localtime(&t);
#else
    localtime_r(&t, &tm);
#endif
    std::ostringstream oss; oss << std::put_time(&tm, "%Y%m%d-%H%M%S");
    return oss.str();
}


