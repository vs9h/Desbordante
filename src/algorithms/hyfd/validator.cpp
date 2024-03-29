#include "validator.h"

#include <algorithm>
#include <string>
#include <tuple>
#include <utility>
#include <vector>

#include <boost/dynamic_bitset.hpp>
#include <easylogging++.h>

#include "fd_validations.h"
#include "hyfd/util/pli_util.h"
#include "hyfd_config.h"

namespace {

std::vector<size_t> BuildLhsRow(algos::hyfd::Rows const& compressed_records,
                                std::vector<size_t> const& lhs_column_ids, size_t id) {
    std::vector<size_t> sub_cluster;
    sub_cluster.reserve(lhs_column_ids.size());
    for (size_t attr : lhs_column_ids) {
        size_t const lhs_cluster_id = compressed_records[id][attr];

        if (!algos::hyfd::PLIUtil::IsSingletonCluster(lhs_cluster_id)) {
            sub_cluster.push_back(lhs_cluster_id);
        } else {
            return {};
        }
    }
    return sub_cluster;
}

std::unordered_set<size_t> AsSet(boost::dynamic_bitset<> const& bitset) {
    std::unordered_set<size_t> valid_rhss(bitset.count());
    for (size_t attr = bitset.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = bitset.find_next(attr)) {
        valid_rhss.insert(attr);
    }
    return valid_rhss;
}

std::vector<size_t> AsVector(boost::dynamic_bitset<> const& bitset) {
    std::vector<size_t> valid_rhss(bitset.count());
    for (size_t attr = bitset.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = bitset.find_next(attr)) {
        valid_rhss.push_back(attr);
    }
    return valid_rhss;
}

std::pair<std::vector<size_t>, std::vector<size_t>> BuildRhsMappings(
        boost::dynamic_bitset<> const& rhs,
        std::vector<std::vector<size_t>> const& compressed_records) {
    std::vector<size_t> rhs_column_ids;
    rhs_column_ids.reserve(rhs.count());
    std::vector<size_t> rhs_ranks(compressed_records[0].size());

    for (size_t attr = rhs.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = rhs.find_next(attr)) {
        rhs_ranks[attr] = rhs_column_ids.size();
        rhs_column_ids.push_back(attr);
    }

    return std::make_pair(std::move(rhs_column_ids), std::move(rhs_ranks));
}

using LhsRow = std::vector<size_t>;
using RhsRowId = std::pair<std::vector<size_t>, size_t>;

auto LhsRhsMap(size_t bucket_size) {
    auto const kHasher = [](std::vector<size_t> const& v) {
        return boost::hash_range(v.cbegin(), v.cend());
    };
    auto const kEq = [](std::vector<size_t> const& v1, std::vector<size_t> const& v2) {
        return v1 == v2;
    };
    return std::unordered_map<LhsRow, RhsRowId, decltype(kHasher), decltype(kEq)>(bucket_size,
                                                                                  kHasher, kEq);
}

void ValidateRhss(RhsRowId const& rhs_record, algos::hyfd::Rows const& compressed_records,
                  size_t row, std::vector<size_t> const& rhs_ranks,
                  std::unordered_set<size_t>& valid_rhs_ids,
                  algos::hyfd::IdPairs& comparison_suggestions) {
    for (auto it = valid_rhs_ids.begin(); it != valid_rhs_ids.end();) {
        size_t const rhs_column = *it;
        size_t const value = compressed_records[row][rhs_column];

        if (algos::hyfd::PLIUtil::IsSingletonCluster(value) ||
            value != rhs_record.first[rhs_ranks[rhs_column]]) {

            comparison_suggestions.emplace_back(row, rhs_record.second);
            it = valid_rhs_ids.erase(it);
            if (valid_rhs_ids.empty()) {
                return;
            }
        } else {
            ++it;
        }
    }
}

RhsRowId BuildRhsRowId(algos::hyfd::Rows const& compressed_records,
                       boost::dynamic_bitset<> const& rhs,
                       std::vector<size_t> const& rhs_column_ids, size_t row) {
    std::vector<size_t> rhs_sub_cluster(rhs.count());
    for (size_t i = 0; i < rhs.count(); ++i) {
        rhs_sub_cluster[i] = compressed_records[row][rhs_column_ids[i]];
    }

    return std::make_pair(std::move(rhs_sub_cluster), row);
}

boost::dynamic_bitset<> Refine(algos::hyfd::IdPairs& comparison_suggestions,
                               algos::hyfd::PLIs const& plis,
                               algos::hyfd::Rows const& compressed_records,
                               boost::dynamic_bitset<> const& lhs,
                               boost::dynamic_bitset<> const& rhs, size_t firstAttr) {
    auto valid_rhs_ids = AsSet(rhs);
    auto const lhs_column_ids = AsVector(lhs);
    auto const [rhs_column_ids, rhs_ranks] = BuildRhsMappings(rhs, compressed_records);

    for (auto const& cluster : plis[firstAttr]->GetIndex()) {
        auto lhs_rhs_map = LhsRhsMap(cluster.size());

        for (size_t row : cluster) {
            auto lhs_row = BuildLhsRow(compressed_records, lhs_column_ids, row);
            if (lhs_row.empty()) {
                continue;
            }

            auto const iter = lhs_rhs_map.find(lhs_row);

            if (iter != lhs_rhs_map.end()) {
                ValidateRhss(iter->second, compressed_records, row, rhs_ranks, valid_rhs_ids,
                             comparison_suggestions);
            } else {
                RhsRowId rhs_row_id = BuildRhsRowId(compressed_records, rhs, rhs_column_ids, row);

                lhs_rhs_map.emplace(std::move(lhs_row), std::move(rhs_row_id));
            }
        }
    }
    return util::IndicesToBitset(valid_rhs_ids, rhs.size());
}

std::vector<algos::hyfd::LhsPair> CollectCurrentChildren(
        std::vector<algos::hyfd::LhsPair> const& cur_level_vertices, size_t num_attributes) {
    std::vector<algos::hyfd::LhsPair> next_level;
    for (auto const& [vertex, lhs] : cur_level_vertices) {
        if (!vertex->HasChildren()) {
            continue;
        }

        for (size_t i = 0; i < num_attributes; ++i) {
            if (!vertex->ContainsChildAt(i)) {
                continue;
            }

            auto child = vertex->GetChildPtr(i);

            boost::dynamic_bitset<> child_lhs = lhs;
            child_lhs.set(i);
            next_level.emplace_back(std::move(child), std::move(child_lhs));
        }
    }

    return next_level;
}

size_t AddExtendedCandidatesFromInvalid(std::vector<algos::hyfd::LhsPair>& next_level,
                                        algos::hyfd::fd_tree::FDTree& fds_tree,
                                        std::vector<RawFD> const& invalid_fds,
                                        size_t num_attributes) {
    size_t candidates = 0;
    for (auto const& [lhs, rhs] : invalid_fds) {
        for (size_t attr = 0; attr < num_attributes; ++attr) {
            if (lhs.test(attr) || rhs == attr || fds_tree.FindFdOrGeneral(lhs, attr) ||
                (fds_tree.GetRoot().HasChildren() &&
                 fds_tree.GetRoot().ContainsChildAt(attr) &&
                 fds_tree.GetRoot().GetChild(attr)->IsFd(rhs))) {
                continue;
            }

            boost::dynamic_bitset<> lhs_ext = lhs;
            lhs_ext.set(attr);

            if (fds_tree.FindFdOrGeneral(lhs_ext, rhs)) {
                continue;
            }

            auto child = fds_tree.AddFD(lhs_ext, rhs);
            if (child == nullptr) {
                continue;
            }
            next_level.emplace_back(std::move(child), std::move(lhs_ext));
            candidates++;
        }
    }
    return candidates;
}

}  // namespace

namespace algos::hyfd {

Validator::FDValidations Validator::ProcessZeroLevel(LhsPair const& lhsPair) {
    FDValidations result;

    auto vertex = lhsPair.first;
    auto const lhs = lhsPair.second;
    auto const rhs = vertex->GetFDs();
    size_t const rhs_count = rhs.count();

    result.count_intersections_ = rhs_count;
    result.count_validations_ = rhs_count;

    for (size_t attr = rhs.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = rhs.find_next(attr)) {
        if (!(*plis_)[attr]->IsConstant()) {
            vertex->RemoveFd(attr);
            result.invalid_fds_.emplace_back(lhs, attr);
        }
    }

    return result;
}

Validator::FDValidations Validator::ProcessFirstLevel(LhsPair const& lhs_pair) {
    auto vertex = lhs_pair.first;
    auto const lhs = lhs_pair.second;
    auto const rhs = vertex->GetFDs();
    size_t const rhs_count = rhs.count();

    size_t const lhs_attr = lhs.find_first();
    if (lhs_attr == boost::dynamic_bitset<>::npos) {
        return {};
    }

    FDValidations result;

    result.count_intersections_ = rhs_count;
    result.count_validations_ = rhs_count;

    for (size_t attr = rhs.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = rhs.find_next(attr)) {
        for (const auto& cluster : (*plis_)[lhs_attr]->GetIndex()) {
            size_t const cluster_id = (*compressed_records_)[cluster[0]][attr];
            if (PLIUtil::IsSingletonCluster(cluster_id) ||
                std::any_of(cluster.cbegin(), cluster.cend(), [this, attr, cluster_id](int id) {
                    return (*compressed_records_)[id][attr] != cluster_id;
                })) {
                vertex->RemoveFd(attr);
                result.invalid_fds_.emplace_back(lhs, attr);
                break;
            }
        }
    }
    return result;
}

Validator::FDValidations Validator::ProcessHigherLevel(LhsPair const& lhs_pair) {
    auto vertex = lhs_pair.first;
    auto lhs = lhs_pair.second;
    auto rhs = vertex->GetFDs();
    size_t const rhs_count = rhs.count();

    if (rhs_count == 0) {
        return {};
    }

    FDValidations result;
    result.count_validations_ = rhs_count;
    result.count_intersections_ = 1;

    size_t const first_attr = lhs.find_first();

    lhs.reset(first_attr);
    boost::dynamic_bitset<> const valid_rhss = Refine(result.comparison_suggestions_, *plis_,
                                                      *compressed_records_, lhs, rhs, first_attr);
    lhs.set(first_attr);

    rhs &= ~valid_rhss;
    vertex->SetFds(valid_rhss);

    for (size_t attr = rhs.find_first(); attr != boost::dynamic_bitset<>::npos;
         attr = rhs.find_next(attr)) {
        result.invalid_fds_.emplace_back(lhs, attr);
    }

    return result;
}

Validator::FDValidations Validator::GetValidations(LhsPair const& lhsPair) {
    if (GetLevelNum() == 0) {
        return ProcessZeroLevel(lhsPair);
    }

    if (GetLevelNum() == 1) {
        return ProcessFirstLevel(lhsPair);
    }

    return ProcessHigherLevel(lhsPair);
}

Validator::FDValidations Validator::ValidateAndExtendSeq(std::vector<LhsPair> const& vertices) {
    FDValidations result;
    for (auto const& vertex : vertices) {
        result.add(GetValidations(vertex));
    }

    return result;
}

// todo(strutovsky): make indices unsigned in core structures
// NOLINTBEGIN(*-narrowing-conversions)

IdPairs Validator::ValidateAndExtendCandidates() {
    size_t const num_attributes = plis_->size();

    std::vector<LhsPair> cur_level_vertices;
    if (current_level_number_ != 0) {
        cur_level_vertices = fds_->GetLevel(current_level_number_);
    } else {
        cur_level_vertices.emplace_back(fds_->GetRootPtr(),
                                        boost::dynamic_bitset<>(num_attributes));
    }

    int previous_num_invalid_fds = 0;
    IdPairs comparison_suggestions;
    while (!cur_level_vertices.empty()) {
        auto const result = ValidateAndExtendSeq(cur_level_vertices);

        comparison_suggestions.insert(comparison_suggestions.end(),
                                      result.comparison_suggestions_.begin(),
                                      result.comparison_suggestions_.end());
        if (current_level_number_ >= fds_->GetNumAttributes()) {
            break;
        }

        std::vector<LhsPair> next_level =
                CollectCurrentChildren(cur_level_vertices, num_attributes);
        size_t candidates = AddExtendedCandidatesFromInvalid(next_level, *fds_, result.invalid_fds_,
                                                             num_attributes);
        LogLevel(cur_level_vertices, result, candidates);

        int const num_invalid_fds = result.invalid_fds_.size();
        int const num_valid_fds = result.count_validations_ - num_invalid_fds;
        cur_level_vertices = std::move(next_level);
        current_level_number_++;

        if (num_invalid_fds > hyfd::HyFDConfig::kEfficiencyThreshold * num_valid_fds &&
            previous_num_invalid_fds < num_invalid_fds) {
            return comparison_suggestions;
        }
        previous_num_invalid_fds = num_invalid_fds;
    }

    return {};
}

void Validator::LogLevel(const std::vector<LhsPair>& cur_level_vertices,
                         const Validator::FDValidations& result, size_t candidates) const {
    int const num_invalid_fds = result.invalid_fds_.size();
    int const num_valid_fds = result.count_validations_ - num_invalid_fds;

    LOG(INFO) << "LEVEL " + std::to_string(current_level_number_) + "(" +
                         std::to_string(cur_level_vertices.size()) + "): "
              << std::to_string(result.count_intersections_) + " intersections; "
              << std::to_string(result.count_validations_) + " validations; "
              << std::to_string(num_invalid_fds) + " invalid; "
              << std::to_string(candidates) + " new candidates; --> "
              << std::to_string(num_valid_fds) + " FDs";
}

// NOLINTEND(*-narrowing-conversions)

}  // namespace algos::hyfd
