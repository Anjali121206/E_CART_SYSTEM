# E‑Cart Management System

A console-first E‑Commerce Cart application built in C++ demonstrating OOP (Abstraction, Encapsulation, Inheritance, Polymorphism), SOLID principles, file-based persistence, and an optional React frontend.

## Structure

EcartSystem/
- backend/ (C++ core, console UI, CMake)
- frontend/ (optional React scaffold)
- data/ (sample users, products, orders, sales, config)

## Build (Backend)

1. mkdir build && cd build
2. cmake .. -DCMAKE_BUILD_TYPE=Release
3. cmake --build .
4. ./ecart (or ecart.exe on Windows)

## Team Modules
- User Management (Encapsulation, security)
- Product & Inventory (Abstraction, Inheritance)
- Cart & Payment (Polymorphism, Strategy)
- Admin & Reports (Inheritance, File I/O)

## Data Files
- users.txt, products.txt, orders.txt, sales.txt, config.json


