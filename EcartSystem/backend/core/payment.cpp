#include "payment.h"
#include <stdexcept>
#include <iostream>

void UpiPayment::makePayment(double amount) {
    if (amount <= 0) throw std::runtime_error("Invalid amount");
    std::cout << "Payment via UPI successful for Rs. " << amount << "\n";
}

void CardPayment::makePayment(double amount) {
    if (amount <= 0) throw std::runtime_error("Invalid amount");
    std::cout << "Payment via Card successful for Rs. " << amount << "\n";
}

void CashOnDelivery::makePayment(double amount) {
    if (amount <= 0) throw std::runtime_error("Invalid amount");
    std::cout << "Order placed with Cash on Delivery. Amount due: Rs. " << amount << "\n";
}


