import { getTasksResults, testTaskWithDeps } from "./util";

jest.setTimeout(10000);

const getDefaultCFDFilter = (
    withoutKeys = false
): Parameters<typeof getTasksResults>[1]["filter"] => ({
    pagination: { offset: 0, limit: 10 },
    filterString: "",
    withoutKeys,
    orderDirection: "ASC",
    CFDSortBy: "RHS_COL_NAME",
});

const getCFDFilter = (
    params: Partial<Parameters<typeof getTasksResults>[1]["filter"]>
) => ({
    ...getDefaultCFDFilter(false),
    ...params,
});

it("test CFD task", async () => {
    await testTaskWithDeps(
        {
            fileName: "TestLong",
            props: {
                algorithmName: "CTane",
                minConfidence: 1,
                minSupportCFD: 1,
                maxLHS: 5,
                type: "CFD",
            },
        },
        getDefaultCFDFilter(true),
        { depsAmount: 36, filteredDepsAmount: 36 }
    );
});

it("test CFD task with incorrect filter string", async () => {
    await testTaskWithDeps(
        {
            fileName: "TestLong",
            props: {
                algorithmName: "CTane",
                minConfidence: 1,
                minSupportCFD: 1,
                maxLHS: 5,
                type: "CFD",
            },
        },
        getCFDFilter({ filterString: "wud" }),
        { depsAmount: 36, filteredDepsAmount: 0 }
    );
});

it("test CFD task with another sortby", async () => {
    await testTaskWithDeps(
        {
            fileName: "TestLong",
            props: {
                algorithmName: "CTane",
                minConfidence: 1,
                minSupportCFD: 1,
                maxLHS: 5,
                type: "CFD",
            },
        },
        getCFDFilter({ CFDSortBy: "RHS_PATTERN" }),
        { depsAmount: 36, filteredDepsAmount: 36 }
    );
});
