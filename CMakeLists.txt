cmake_minimum_required(VERSION 3.10)
project(Desbordante)

option(ENABLE_PYBIND_COMPILE "Build the python bindings" ON)
option(ENABLE_TESTS_COMPILE "Build tests" ON)

# By default select Debug build
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif(NOT CMAKE_BUILD_TYPE)

# compiler and platform-dependent settings
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY  "${CMAKE_BINARY_DIR}/target")
if (MSVC)
    add_compile_options(/MT /MTd /EHsc)
    add_compile_options("$<$<CONFIG:Release>:/O2>")

    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG  "${CMAKE_BINARY_DIR}/target")
    set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE  "${CMAKE_BINARY_DIR}/target")
else()
    # -DELPP_THREAD_SAFE -- for easylogging++ thread safety
    add_compile_options("$<$<CONFIG:Debug>:-O0;-DELPP_THREAD_SAFE;-g;-Wall;-Wextra;-Werror;-fno-omit-frame-pointer;-fsanitize=address>")
    add_link_options("$<$<CONFIG:Debug>:-fsanitize=address>")
    add_compile_options("$<$<CONFIG:Release>:-O3;-DELPP_THREAD_SAFE>")
endif()

# configuring boost
set(Boost_USE_STATIC_LIBS ON)
find_package(Boost 1.72.0 REQUIRED COMPONENTS container program_options thread)
include_directories(${Boost_INCLUDE_DIRS})
message(${Boost_INCLUDE_DIRS})

# providing subdirectories for header inclusion
include_directories(
    "src/algorithms"
    "src/algorithms/aidfd"
    "src/algorithms/dfd"
    "src/algorithms/association_rules"
    "src/algorithms/depminer"
    "src/algorithms/statistics"
    "src/algorithms/ctane"
    "src/algorithms/options"
    "src/model"
    "src/model/types"
    "src/util"
    "src/parser"
    "src/parser/json"
    "src/core"
    "src/caching"
    "src/logging"
    "src"
    )

if (ENABLE_TESTS_COMPILE)
    include_directories("src/tests")
endif()

include_directories(SYSTEM "lib/easyloggingpp/src" "lib/better-enums/")

add_subdirectory("cpp-consumer")

# adding submodules
if (ENABLE_TESTS_COMPILE)
    add_subdirectory("lib/googletest")
endif()
if (ENABLE_PYBIND_COMPILE)
    add_subdirectory("lib/pybind11")
endif()

set( CMAKE_BUILD_TYPE_COPY "${CMAKE_BUILD_TYPE}" )
set( CMAKE_BUILD_TYPE "Release" )
option(build_static_lib "Build easyloggingpp as a static library" ON)
add_subdirectory("lib/easyloggingpp")
set( CMAKE_BUILD_TYPE ${CMAKE_BUILD_TYPE_COPY} )

add_subdirectory("src")

if (ENABLE_TESTS_COMPILE)
    add_subdirectory("tests")
    add_subdirectory("datasets")
endif()
add_subdirectory("cfg")

if (ENABLE_PYBIND_COMPILE)
    add_subdirectory("python_bindings")
endif()
