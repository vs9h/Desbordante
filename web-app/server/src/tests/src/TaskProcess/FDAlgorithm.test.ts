import { createMainTask, getTasksResults, testTaskWithDeps } from "./util";
import { allowedFDAlgorithms } from "../../../graphql/schema/AppConfiguration/resolvers";

jest.setTimeout(10000);

const getDefaultFDProps = (
    algorithmName = "Pyro"
): Parameters<typeof createMainTask>[1]["props"] => ({
    algorithmName,
    type: "FD",
    errorThreshold: 0,
    maxLHS: -1,
    threadsCount: 1,
});

const getDefaultFDFilter = (
    withoutKeys = false
): Parameters<typeof getTasksResults>[1]["filter"] => ({
    pagination: { offset: 0, limit: 10 },
    filterString: "",
    withoutKeys,
    orderDirection: "ASC",
    FDSortBy: "LHS_COL_ID",
});

const testFDTaskWithDefaultParamsParallel = async (
    fileName: string,
    expected: Parameters<typeof testTaskWithDeps>[2],
    skipAlgorithms: string[] = []
) =>
    Promise.all(
        allowedFDAlgorithms
            .map(({ name }) => name)
            .map(async (algorithmName) => {
                if (skipAlgorithms.includes(algorithmName)) {
                    return;
                }
                await testTaskWithDeps(
                    {
                        fileName,
                        props: getDefaultFDProps(algorithmName),
                    },
                    getDefaultFDFilter(false),
                    expected
                );
            })
    );

it("test FD task processing (Pyro, breast_cancer)", async () => {
    await testFDTaskWithDefaultParamsParallel(
        "breast_cancer",
        { depsAmount: 11430, filteredDepsAmount: 11430 },
        ["FD mine"]
    );
});

it("test FD algorithms task processing (Workshop)", async () =>
    await testFDTaskWithDefaultParamsParallel(
        "Workshop",
        {
            depsAmount: 11,
            filteredDepsAmount: 11,
        },
        ["FD mine"]
    ));

it("test FD algorithms task processing (TestLong)", async () =>
    await testFDTaskWithDefaultParamsParallel("TestLong", {
        depsAmount: 1,
        filteredDepsAmount: 1,
    }));

it("test FD algorithms task processing (WDC_age)", async () => {
    await testFDTaskWithDefaultParamsParallel("WDC_age", {
        depsAmount: 6,
        filteredDepsAmount: 6,
    });
});

it("test FD algorithms task processing (CIPublicHighway700)", async () => {
    await testFDTaskWithDefaultParamsParallel(
        "CIPublicHighway700",
        {
            depsAmount: 27,
            filteredDepsAmount: 27,
        },
        ["FD mine"]
    );
});
