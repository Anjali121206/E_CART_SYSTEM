#include "file_store.h"
#include <fstream>
#include <stdexcept>
#include <cstdio>

std::vector<std::string> FileStore::readAllLines(const std::string& path) {
    std::ifstream in(path);
    std::vector<std::string> lines; std::string line;
    if (!in.good()) return lines;
    while (std::getline(in, line)) lines.push_back(line);
    return lines;
}

void FileStore::writeAllLinesAtomic(const std::string& path, const std::vector<std::string>& lines) {
    std::string tmp = path + ".tmp";
    std::ofstream out(tmp, std::ios::trunc);
    if (!out) throw std::runtime_error("Cannot write: " + tmp);
    for (size_t i = 0; i < lines.size(); ++i) {
        out << lines[i];
        if (i + 1 < lines.size()) out << '\n';
    }
    out.close();
    std::remove(path.c_str());
    std::rename(tmp.c_str(), path.c_str());
}

void FileStore::appendLine(const std::string& path, const std::string& line) {
    std::ofstream out(path, std::ios::app);
    if (!out) throw std::runtime_error("Cannot append: " + path);
    out << line << '\n';
}


