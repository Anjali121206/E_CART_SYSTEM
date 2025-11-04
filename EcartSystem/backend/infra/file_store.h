#pragma once
#include <string>
#include <vector>

class FileStore {
public:
    static std::vector<std::string> readAllLines(const std::string& path);
    static void writeAllLinesAtomic(const std::string& path, const std::vector<std::string>& lines);
    static void appendLine(const std::string& path, const std::string& line);
};


