set(BINARY ${CMAKE_PROJECT_NAME}_cpp_consumer)

file(GLOB_RECURSE cpp_consumer_sources "*.h*" "*.cpp*")

add_library(${BINARY}_lib STATIC ${cpp_consumer_sources})

set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)
find_library(PQXX_LIB pqxx)

set(run_sources "main.cpp")

add_executable(${BINARY} ${run_sources})

target_link_libraries(${BINARY} PUBLIC ${CMAKE_PROJECT_NAME}_lib ${BINARY}_lib ${PQXX_LIB})
target_link_libraries(${BINARY} LINK_PUBLIC ${Boost_LIBRARIES} Threads::Threads easyloggingpp)