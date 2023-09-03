#pragma once

#include <boost/algorithm/string.hpp>

#include "data/database.h"
#include "iexecutor.h"

namespace process {

class ARExecutor final : public IExecutor {
    bool InternalLoadData(db::DataBase const& db, db::ParamsLoader& loader, BaseConfig const& c,
                          pqxx::row const& row) const final;
    bool SaveResults(db::DataBase const& db, BaseConfig const& c) const final;
};
}  // namespace process