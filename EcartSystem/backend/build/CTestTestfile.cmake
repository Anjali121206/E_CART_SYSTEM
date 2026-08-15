# CMake generated Testfile for 
# Source directory: C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend
# Build directory: C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/build
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test(dummy "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/build/Debug/ecart_tests.exe")
  set_tests_properties(dummy PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;59;add_test;C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test(dummy "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/build/Release/ecart_tests.exe")
  set_tests_properties(dummy PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;59;add_test;C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test(dummy "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/build/MinSizeRel/ecart_tests.exe")
  set_tests_properties(dummy PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;59;add_test;C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test(dummy "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/build/RelWithDebInfo/ecart_tests.exe")
  set_tests_properties(dummy PROPERTIES  _BACKTRACE_TRIPLES "C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;59;add_test;C:/Users/ANJALI RATHI/Downloads/ecart/E_CART_SYSTEM/EcartSystem/backend/CMakeLists.txt;0;")
else()
  add_test(dummy NOT_AVAILABLE)
endif()
