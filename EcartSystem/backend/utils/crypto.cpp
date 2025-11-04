#include "crypto.h"
#include <sstream>

// Simple non-cryptographic hash placeholder for demo (replace with real SHA-256 if needed)
std::string Crypto::hash(const std::string& input) {
    unsigned long long h = 1469598103934665603ull; // FNV-1a 64-bit basis
    for (unsigned char c : input) { h ^= c; h *= 1099511628211ull; }
    std::ostringstream oss; oss << std::hex << h; return oss.str();
}


