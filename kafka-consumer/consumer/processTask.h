#include <algorithm>
#include <cctype>
#include <filesystem>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

#include <boost/program_options.hpp>

#include "logging/easylogging++.h"

#include "algorithms/Pyro.h"
#include "algorithms/TaneX.h"
#include "algorithms/FastFDs.h"

#include "../db/DBManager.h"
#include "../db/taskConfig.h"

INITIALIZE_EASYLOGGINGPP

void process_task(taskConfig const& task, DBManager const& manager) {
    auto alg = task.getAlgName();
    auto datasetPath = task.getDatasetPath();
    auto separator = task.getSeparator();
    auto hasHeader = task.getHasHeader();
    auto error = task.getErrorPercent();
    auto maxLHS = task.getMaxLHS();
    
    auto seed = 0;
    unsigned int parallelism = 0;

    el::Loggers::configureFromGlobal("logging.conf");
    
    std::unique_ptr<FDAlgorithm> algorithmInstance;

    if (alg == "Pyro") {
        algorithmInstance = std::make_unique<Pyro>(datasetPath, separator, hasHeader, seed, error, maxLHS, parallelism);
    } else if (alg == "TaneX") {
        algorithmInstance = std::make_unique<Tane>(datasetPath, separator, hasHeader, error, maxLHS);
    } else if (alg == "FastFDs") {
        algorithmInstance = std::make_unique<FastFDs>(datasetPath, separator, hasHeader);
    }

    try {
        task.updateStatus(manager, "IN PROCESS");
        task.updateProgress(manager, 10);

        auto elapsedTime = algorithmInstance->execute();
        
        task.setElapsedTime(manager, elapsedTime);
        task.updateJsonFDs(manager, algorithmInstance->getJsonFDs(false));
        task.updateJsonArrayNameValue(manager, algorithmInstance->getJsonArrayNameValue());
        task.updateJsonColumnNames(manager, algorithmInstance->getJsonColumnNames());

        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
    throw std::runtime_error("Unexpected behavior during task executing");
}