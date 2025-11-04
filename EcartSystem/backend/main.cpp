#include <iostream>
#include <string>
#include "ui/console_ui.h"
#include "infra/config.h"

int main() {
    using std::cout; using std::endl;
    try {
        Config config;
        config.loadDefaultPaths();
        ConsoleUI ui(config);
        ui.run();
    } catch (const std::exception& ex) {
        std::cerr << "Fatal error: " << ex.what() << std::endl;
        return 1;
    }
    return 0;
}


