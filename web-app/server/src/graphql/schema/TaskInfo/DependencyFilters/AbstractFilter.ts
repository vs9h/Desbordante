import { ApolloError, UserInputError } from "apollo-server-core";
import {
    MainPrimitiveType,
    RealPrimitiveType,
} from "../../../../db/models/TaskData/configs/GeneralTaskConfig";
import { CompactData } from "./CompactData";
import { Context } from "../../../types/context";
import { FileInfo } from "../../../../db/models/FileData/FileInfo";
import { IntersectionFilter } from "../../../types/types";
import { TaskState } from "../../../../db/models/TaskData/TaskState";
import _ from "lodash";
import { applyPagination } from "../../../util";

export type SortFunction<CompactDep> = (lhs: CompactDep, rhs: CompactDep) => boolean;
export type ConditionFunction<CompactDep> = (dep: CompactDep) => boolean;
export type ComparatorWithParam<T> = {
    sortBy: string;
    comparator: SortFunction<T>;
};

export type ItemsInfo = { itemValues: string[] };
export type ColumnsInfo = {
    columnNames: string[];
    columnIndicesOrder: number[];
};

export abstract class AbstractFilter<CompactDep, Dep> {
    protected abstract toDependency: (dep: CompactDep) => Dep;
    protected abstract toCompactDep: (data: string) => CompactDep;

    public constructor(
        protected filter: IntersectionFilter,
        protected fileID: string,
        protected readonly type: MainPrimitiveType,
        protected state: TaskState,
        protected context: Context
    ) {}

    abstract initArgs(): Promise<void>;

    protected getSeparator = (): string => {
        return ";";
    };

    protected prepareRawData = _.identity<string>;

    protected applyTransformation = async (deps: CompactDep[]): Promise<CompactDep[]> => {
        return deps;
    };

    private getFilteredCompactDeps = async (deps: CompactDep[]) => {
        deps = (await this.filterDeps(deps)) || [];
        const filteredDepsAmount = deps.length;
        deps = deps.sort(await this.getComparator());
        this.filter.orderDirection === "DESC" && deps.reverse();
        deps = applyPagination(deps, this.filter.pagination, 500);
        deps = await this.applyTransformation(deps);
        return { filteredDepsAmount, deps };
    };

    public getFilteredTransformedDeps = async (data: string) => {
        const compactDeps: CompactDep[] = CompactData.toCompactDeps(
            this.prepareRawData(data),
            this.toCompactDep,
            this.getSeparator()
        );
        const { filteredDepsAmount, deps } = await this.getFilteredCompactDeps(
            compactDeps
        );
        return {
            filteredDepsAmount,
            deps: deps.map(this.toDependency),
        };
    };

    abstract getConditions(): Promise<ConditionFunction<CompactDep>[]>;

    abstract getComparators(): ComparatorWithParam<CompactDep>[];

    public filterDeps = async (deps: CompactDep[]) => {
        const conditions = await this.getConditions();
        return deps.filter((dep) => conditions.every((cond) => cond(dep)));
    };

    private getComparator = async () => {
        const comparators = this.getComparators();
        const temp = comparators[0];
        const mainComparatorIndex = comparators.findIndex(
            ({ sortBy }) => sortBy === this.getMainComparatorParam()
        );
        if (~mainComparatorIndex) {
            comparators[0] = comparators[mainComparatorIndex];
            comparators[mainComparatorIndex] = temp;
        }
        return (lhs: CompactDep, rhs: CompactDep) => {
            for (const { comparator } of comparators) {
                if (comparator(lhs, rhs)) {
                    return -1;
                } else if (comparator(rhs, lhs)) {
                    return 1;
                }
            }
            throw new ApolloError(
                `Unreachable code ${JSON.stringify(lhs)} == ${JSON.stringify(rhs)}`
            );
        };
    };

    public getMainComparatorParam = () => {
        const getStringOrThrowError = <T>(sortBy: T): string => {
            if (_.isString(sortBy)) {
                return sortBy;
            } else {
                throw new UserInputError("SortBy param is undefined");
            }
        };
        switch (this.type) {
            case "AR":
                return getStringOrThrowError(this.filter.ARSortBy);
            case "CFD":
                return getStringOrThrowError(this.filter.CFDSortBy);
            case "FD":
            case "TypoFD":
                return getStringOrThrowError(this.filter.FDSortBy);
            case "MFD":
                return getStringOrThrowError(this.filter.MFDSortBy);
        }
        throw new ApolloError(`Type ${this.type} not implemented yet`);
    };

    public static getColumnsInfo = async (fileID: string): Promise<ColumnsInfo> => {
        const columnNames = await FileInfo.getColumnNamesForFile(fileID);
        const columnIndicesOrder = [...Array(columnNames.length).keys()];
        columnIndicesOrder.sort((l, r) => (columnNames[l] < columnNames[r] ? -1 : 1));
        return { columnNames, columnIndicesOrder };
    };

    public static getItemsInfo = async (
        state: TaskState,
        type: MainPrimitiveType
    ): Promise<ItemsInfo> => {
        const items = await state.getResultFieldAsString(type, "valueDictionary");
        return { itemValues: items.split(",") };
    };

    public static getRealPrimitiveType = (type: MainPrimitiveType): RealPrimitiveType => {
        if (type === "Stats") {
            throw new ApolloError("Use DatasetInfo to get info about stats");
        }
        return type === "TypoFD" ? "FD" : type;
    };
}
