import {
    createMainTask,
    createSpecificTask,
    createTask,
    getSpecificCluster,
    getTasksResults,
    getTypoClusters,
    testTaskWithDeps,
    waitWhileTaskIsRunning,
} from "./util";
import { isSpecificPrimitiveType } from "../../../db/models/TaskData/configs/GeneralTaskConfig";
import { CompactData } from "../../../graphql/schema/TaskInfo/DependencyFilters/CompactData";
import { FD } from "./queries/__generated__/GetMainTaskDeps";
import { getTestServer } from "../../util";

jest.setTimeout(10000);

const testTypoClusterTask = async (
    params: Parameters<typeof createSpecificTask>[1],
    expected: { clustersCount: number }
) => {
    const { type } = params.props;
    if (!isSpecificPrimitiveType(type)) {
        throw new Error("Expected specific primitive type");
    }
    const serverInfo = await getTestServer();
    serverInfo.context.logger("start task with params: ", params);
    const { taskID } = await createTask(serverInfo, params);
    serverInfo.context.logger("task running");
    await waitWhileTaskIsRunning(serverInfo, { taskID });
    const result = await getTypoClusters(serverInfo, {
        taskID,
        squashed: false,
        clustersPagination: { offset: 0, limit: 10 },
        itemsPagination: { offset: 0, limit: 100 },
    });

    expect(result.__typename).toBe(`${type}TaskResult` as const);
    if (result.__typename !== (`${type}TaskResult` as const)) {
        throw new Error("Received incorrect result type");
    }
    expect(result.clustersCount).toBe(expected.clustersCount);
    return { taskID };
};

const getDefaultTypoFDProps = (
    params: Partial<Parameters<typeof createMainTask>[1]["props"]>
): Parameters<typeof createMainTask>[1]["props"] => ({
    preciseAlgorithm: "Pyro",
    approximateAlgorithm: "Pyro",
    algorithmName: "Typo Miner",
    type: "TypoFD",
    errorThreshold: 0,
    maxLHS: -1,
    threadsCount: 2,
    ...params,
});

const getDefaultTypoFDFilter = (
    filter: Partial<Parameters<typeof getTasksResults>[1]["filter"]>
): Parameters<typeof getTasksResults>[1]["filter"] => ({
    pagination: { offset: 0, limit: 10 },
    filterString: "",
    withoutKeys: false,
    orderDirection: "ASC",
    FDSortBy: "LHS_COL_ID",
    ...filter,
});

it("test EDP algorithm task processing (SimpleTypos, radius = 3, ratio = 1)", async () => {
    const { taskID: parentTaskID, deps } = await testTaskWithDeps(
        {
            fileName: "SimpleTypos",
            props: getDefaultTypoFDProps({
                algorithmName: "Typo Miner",
                preciseAlgorithm: "Pyro",
                approximateAlgorithm: "Pyro",
                errorThreshold: 0.1,
                threadsCount: 2,
                defaultRadius: 3,
                maxLHS: 5,
                metric: "LEVENSHTEIN",
                defaultRatio: 1,
            }),
        },
        getDefaultTypoFDFilter({ withoutKeys: false }),
        {
            depsAmount: 2,
            filteredDepsAmount: 2,
        }
    );
    if (deps[0].__typename !== "FD") {
        throw new Error("Received incorrect type");
    }
    const FDs = (deps as FD[]).map(CompactData.FDtoIndices);

    expect(FDs).toStrictEqual([
        [0, 1],
        [1, 2],
    ]);
    const correspondingClusterCounts = [0, 1];
    const typoFDsWithCounts = FDs.map((typoFD, id) => ({
        typoFD,
        clustersCount: correspondingClusterCounts[id],
    }));

    console.log("testTypoCluster task");

    for (const { typoFD, clustersCount } of typoFDsWithCounts) {
        await testTypoClusterTask(
            {
                props: {
                    algorithmName: "Typo Miner",
                    typoFD,
                    parentTaskID,
                    type: "TypoCluster",
                },
            },
            {
                clustersCount,
            }
        );
    }
});

it("test EDP algorithm task processing (SimpleTypos, radius = -1, ratio = 1)", async () => {
    const { taskID: parentTaskID, deps } = await testTaskWithDeps(
        {
            fileName: "SimpleTypos",
            props: getDefaultTypoFDProps({
                algorithmName: "Typo Miner",
                preciseAlgorithm: "Pyro",
                approximateAlgorithm: "Pyro",
                errorThreshold: 0.1,
                threadsCount: 2,
                defaultRadius: -1,
                defaultRatio: 1,
                maxLHS: 5,
                metric: "LEVENSHTEIN",
            }),
        },
        getDefaultTypoFDFilter({ withoutKeys: false }),
        {
            depsAmount: 2,
            filteredDepsAmount: 2,
        }
    );
    if (deps[0].__typename !== "FD") {
        throw new Error("Received incorrect type");
    }
    const FDs = (deps as FD[]).map(CompactData.FDtoIndices);

    expect(FDs).toStrictEqual([
        [0, 1],
        [1, 2],
    ]);
    const correspondingClusterCounts = [1, 1];
    const typoFDsWithCounts = FDs.map((typoFD, id) => ({
        typoFD,
        clustersCount: correspondingClusterCounts[id],
    }));

    await Promise.all(
        typoFDsWithCounts.map(async ({ typoFD, clustersCount }) => {
            await testTypoClusterTask(
                {
                    props: {
                        algorithmName: "Typo Miner",
                        typoFD,
                        parentTaskID,
                        type: "TypoCluster",
                    },
                },
                {
                    clustersCount,
                }
            );
        })
    );
});

it("test EDP algorithm task processing (Workshop)", async () => {
    const { taskID: parentTaskID, deps } = await testTaskWithDeps(
        {
            fileName: "Workshop",
            props: getDefaultTypoFDProps({
                errorThreshold: 0.1,
                defaultRadius: 3,
                maxLHS: 5,
                metric: "LEVENSHTEIN",
                defaultRatio: 1,
            }),
        },
        getDefaultTypoFDFilter({ withoutKeys: true }),
        {
            depsAmount: 11,
            filteredDepsAmount: 11,
        }
    );
    if (deps[0].__typename !== "FD") {
        throw new Error("Received incorrect type");
    }
    const FDs = deps as FD[];
    expect(FDs.length).toBe(10);
    const correspondingClusterCounts = [1, 28, 28, 0, 0, 0, 15, 15, 0, 0];
    const FDsWithCounts = FDs.map((data, id) => ({
        ...data,
        clustersCount: correspondingClusterCounts[id],
    }));

    for (const { lhs, rhs, clustersCount } of FDsWithCounts) {
        const typoFD = [...lhs.map(({ index }) => index), rhs.index];
        await testTypoClusterTask(
            {
                props: {
                    algorithmName: "Typo Miner",
                    typoFD,
                    parentTaskID,
                    type: "TypoCluster",
                },
            },
            {
                clustersCount,
            }
        );
    }
});

it("test EDP algorithm task processing (SimpleTypos, radius = -1, ratio = 1)", async () => {
    const { taskID: parentTaskID, deps } = await testTaskWithDeps(
        {
            fileName: "SimpleTypos",
            props: getDefaultTypoFDProps({
                algorithmName: "Typo Miner",
                preciseAlgorithm: "Pyro",
                approximateAlgorithm: "Pyro",
                errorThreshold: 0.1,
                threadsCount: 2,
                defaultRadius: -1,
                maxLHS: 5,
                metric: "LEVENSHTEIN",
                defaultRatio: 1,
            }),
        },
        getDefaultTypoFDFilter({ withoutKeys: false }),
        {
            depsAmount: 2,
            filteredDepsAmount: 2,
        }
    );
    if (deps[0].__typename !== "FD") {
        throw new Error("Received incorrect type");
    }
    const FDs = (deps as FD[]).map(CompactData.FDtoIndices);

    expect(FDs).toStrictEqual([
        [0, 1],
        [1, 2],
    ]);
    const { taskID } = await testTypoClusterTask(
        {
            props: {
                algorithmName: "Typo Miner",
                typoFD: [0, 1],
                parentTaskID,
                type: "TypoCluster",
            },
        },
        {
            clustersCount: 1,
        }
    );

    console.log("hm");

    await getSpecificCluster(await getTestServer(), {
        taskID,
        clusterID: 0,
        itemsPagination: { offset: 0, limit: 10 },
        sort: true,
        squashed: false,
        squashedRow: false,
    });

    const correspondingClusterCounts = [1, 1];
    const typoFDsWithCounts = FDs.map((typoFD, id) => ({
        typoFD,
        clustersCount: correspondingClusterCounts[id],
    }));

    await Promise.all(
        typoFDsWithCounts.map(async ({ typoFD, clustersCount }) => {
            await testTypoClusterTask(
                {
                    props: {
                        algorithmName: "Typo Miner",
                        typoFD,
                        parentTaskID,
                        type: "TypoCluster",
                    },
                },
                {
                    clustersCount,
                }
            );
        })
    );
});
