cmake_minimum_required(VERSION 3.15)
project(ecart LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(ecart_core
    core/user.cpp
    core/product.cpp
    core/product_types/electronics.cpp
    core/product_types/clothing.cpp
    core/product_types/grocery.cpp
    core/product_types/snack.cpp
    core/product_types/beverage.cpp
    core/product_types/dairy.cpp
    core/offer.cpp
    core/delivery.cpp
    core/cart.cpp
    core/payment.cpp
    core/admin.cpp
    core/inventory.cpp
    core/order.cpp
    core/order_status.cpp
    core/tracker.cpp
    core/rider_simulator.cpp
    core/invoice_builder.cpp
    core/review.cpp
    core/wishlist.cpp
    core/price_policy.cpp
    core/product_factory.cpp
    core/notification.cpp
    core/services/product_service.cpp
    core/services/user_service.cpp
    core/services/order_service.cpp
    core/services/review_service.cpp
    core/services/wishlist_service.cpp
    infra/file_store.cpp
    infra/user_repository.cpp
    infra/product_repository.cpp
    infra/order_repository.cpp
    utils/crypto.cpp
    utils/validation.cpp
    utils/time.cpp
    ui/console_ui.cpp
    infra/logger.cpp
    infra/config.cpp
)

target_include_directories(ecart_core PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)

add_executable(ecart main.cpp)
target_link_libraries(ecart PRIVATE ecart_core)

enable_testing()
add_executable(ecart_tests tests/dummy_tests.cpp)
target_link_libraries(ecart_tests PRIVATE ecart_core)
add_test(NAME dummy COMMAND ecart_tests)

# Optional REST server (requires third_party/httplib.h)
add_executable(ecart_server main_server.cpp)
target_link_libraries(ecart_server PRIVATE ecart_core)
target_include_directories(ecart_server PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/third_party)


