#pragma once

class Payment {
public:
    virtual ~Payment() = default;
    virtual void makePayment(double amount) = 0;
};

class UpiPayment : public Payment { public: void makePayment(double amount) override; };
class CardPayment : public Payment { public: void makePayment(double amount) override; };
class CashOnDelivery : public Payment { public: void makePayment(double amount) override; };


