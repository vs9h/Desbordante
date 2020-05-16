#pragma once

#include <boost/lexical_cast.hpp>
#include "model/Column.h"
#include "model/Vertical.h"

class PartialKey {
public:
    double error_;
    std::shared_ptr<Vertical> vertical_;
    double score_;

    PartialKey(std::shared_ptr<Vertical> vertical, double error, double score) : vertical_(std::move(vertical)), error_(error), score_(score) {}

    std::string toString() const { return vertical_->toString() + "~>" + boost::lexical_cast<std::string>(error_) + boost::lexical_cast<std::string>(score_); }
    //double getError() const { return error_; }
    //int getArity() const { return lhs_->getColumns().size(); }
};