#include "algorithms/hyfd/hyfd.h"

#include <algorithm>
#include <chrono>
#include <memory>
#include <tuple>
#include <utility>
#include <vector>

#include <boost/dynamic_bitset.hpp>
#include <easylogging++.h>

#include "algorithms/hyfd/inductor.h"
#include "algorithms/hyfd/sampler.h"
#include "algorithms/hyfd/util/pli_util.h"
#include "algorithms/hyfd/validator.h"

namespace {

std::vector<size_t> SortAndGetMapping(algos::hyfd::PLIs& plis) {
    size_t id = 0;
    std::vector<std::pair<algos::hyfd::PLIs::value_type, size_t>> plis_sort_ids;
    std::transform(plis.begin(), plis.end(), std::back_inserter(plis_sort_ids),
                   [&id](auto& pli) { return std::make_pair(std::move(pli), id++); });

    auto const kClusterQuantityDescending = [](auto const& pli1, auto const& pli2) {
        return pli1.first->GetNumCluster() > pli2.first->GetNumCluster();
    };
    std::sort(plis_sort_ids.begin(), plis_sort_ids.end(), kClusterQuantityDescending);

    std::transform(plis_sort_ids.begin(), plis_sort_ids.end(), plis.begin(),
                   [](auto& pli_ext) { return std::move(pli_ext.first); });

    std::vector<size_t> og_mapping(plis_sort_ids.size());
    std::transform(plis_sort_ids.begin(), plis_sort_ids.end(), og_mapping.begin(),
                   [](auto const& pli_ext) { return pli_ext.second; });
    return og_mapping;
}

algos::hyfd::Columns BuildInvertedPlis(algos::hyfd::PLIs const& plis) {
    algos::hyfd::Columns inverted_plis;

    for (auto const& pli : plis) {
        size_t cluster_id = 0;
        std::vector<size_t> current(pli->getRelationSize(),
                                    algos::hyfd::PLIUtil::kSingletonClusterId);
        for (const auto& cluster : pli->GetIndex()) {
            for (int value : cluster) {
                current[value] = cluster_id;
            }
            cluster_id++;
        }
        inverted_plis.push_back(std::move(current));
    }
    return inverted_plis;
}

algos::hyfd::Rows BuildRecordRepresentation(algos::hyfd::Columns const& inverted_plis) {
    size_t const num_columns = inverted_plis.size();
    size_t const num_rows = num_columns == 0 ? 0 : inverted_plis.begin()->size();

    algos::hyfd::Rows pli_records(num_rows, std::vector<size_t>(num_columns));

    for (size_t i = 0; i < num_rows; ++i) {
        for (size_t j = 0; j < num_columns; ++j) {
            pli_records[i][j] = inverted_plis[j][i];
        }
    }

    return pli_records;
}

}  // namespace

namespace algos::hyfd {

HyFD::HyFD() : PliBasedFDAlgorithm({}) {}

std::tuple<PLIs, Rows, std::vector<size_t>> HyFD::Preprocess() {
    PLIs plis;
    std::transform(relation_->GetColumnData().begin(), relation_->GetColumnData().end(),
                   std::back_inserter(plis),
                   [](auto& columnData) { return columnData.GetPositionListIndex(); });

    auto og_mapping = SortAndGetMapping(plis);

    const auto inverted_plis = BuildInvertedPlis(plis);

    auto pli_records = BuildRecordRepresentation(inverted_plis);

    return std::make_tuple(std::move(plis), std::move(pli_records), std::move(og_mapping));
}

unsigned long long HyFD::ExecuteInternal() {
    LOG(TRACE) << "Executing";
    auto const start_time = std::chrono::system_clock::now();

    auto [plis, pli_records, og_mapping] = Preprocess();
    auto const plis_shared = std::make_shared<PLIs>(std::move(plis));
    auto const pli_records_shared = std::make_shared<Rows>(std::move(pli_records));

    Sampler sampler(plis_shared, pli_records_shared);

    auto const positive_cover_tree =
            std::make_shared<fd_tree::FDTree>(GetRelation().GetNumColumns());
    Inductor inductor(positive_cover_tree);
    Validator validator(positive_cover_tree, plis_shared, pli_records_shared);

    IdPairs comparison_suggestions;

    while (true) {
        auto non_fds = sampler.GetNonFDCandidates(comparison_suggestions);

        inductor.UpdateFdTree(std::move(non_fds));

        comparison_suggestions = validator.ValidateAndExtendCandidates();

        if (comparison_suggestions.empty()) {
            break;
        }

        LOG(TRACE) << "Cycle done";
    }

    auto fds = positive_cover_tree->FillFDs();
    RegisterFDs(std::move(fds), og_mapping);

    SetProgress(kTotalProgressPercent);

    auto elapsed_milliseconds = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - start_time);
    return elapsed_milliseconds.count();
}

void HyFD::RegisterFDs(std::vector<RawFD>&& fds, const std::vector<size_t>& og_mapping) {
    const auto* const schema = GetRelation().GetSchema();
    for (auto&& [lhs, rhs] : fds) {
        boost::dynamic_bitset<> mapped_lhs(schema->GetNumColumns());
        for (size_t i = lhs.find_first(); i != boost::dynamic_bitset<>::npos;
             i = lhs.find_next(i)) {
            mapped_lhs.set(og_mapping[i]);
        }
        Vertical lhs_v(schema, std::move(mapped_lhs));

        size_t const mapped_rhs = og_mapping[rhs];
        // todo(strutovsky): make indices unsigned in core structures
        // NOLINTNEXTLINE(*-narrowing-conversions)
        Column rhs_c(schema, schema->GetColumn(mapped_rhs)->GetName(), mapped_rhs);

        RegisterFd(std::move(lhs_v), std::move(rhs_c));
    }
}

}  // namespace algos::hyfd
