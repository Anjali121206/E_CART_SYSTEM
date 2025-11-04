#include "validation.h"

bool Validation::isEmail(const std::string& s) {
    auto at = s.find('@'); auto dot = s.find('.', at == std::string::npos ? 0 : at);
    return at != std::string::npos && dot != std::string::npos && at > 0 && dot > at + 1;
}


