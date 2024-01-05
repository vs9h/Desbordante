import { ApolloError, UserInputError } from "apollo-server-core";
import {
    DBTaskPrimitiveType,
    GeneralTaskConfig,
    SpecificPrimitiveType,
    isMainPrimitiveType,
    isSpecificPrimitiveType,
} from "../../../../db/models/TaskData/configs/GeneralTaskConfig";
import {
    InputMaybe,
    Scalars,
    SpecificClusterTaskProps,
} from "../../../../tests/__generated__/types";
import {
    IntersectionMainTaskProps,
    IntersectionSpecificTaskProps,
    MainPrimitiveType,
} from "../../../types/types";
import {
    SchemaType,
    getMainTaskSchema,
    getSpecificClusterTaskSchema,
    getSpecificTaskSchema,
} from "./schema";
import { Context } from "../../../types/context";
import { FileInfo } from "../../../../db/models/FileData/FileInfo";
import { TaskStatusType } from "../../../../db/models/TaskData/TaskState";
import { allowedAlgorithms } from "../../AppConfiguration/resolvers";
import { produce } from "../../../../producer";

export type ParentSpecificClusterTaskProps = Omit<
    SpecificClusterTaskProps,
    "squash" | "sort"
> & {
    type: "SpecificTypoCluster";
    parentTaskID: string;
    algorithmName: string;
};

export type RawPropsType =
    | IntersectionMainTaskProps
    | IntersectionSpecificTaskProps
    | ParentSpecificClusterTaskProps;

export type TransformedIntersectionSpecificTaskProps = Omit<
    IntersectionSpecificTaskProps,
    "typoFD"
> & { typoFD?: InputMaybe<Scalars["String"]> };

export type TransformedSpecificClusterTaskProps = Omit<
    ParentSpecificClusterTaskProps,
    "squash" | "sort"
>;

export type PropsType =
    | IntersectionMainTaskProps
    | TransformedIntersectionSpecificTaskProps
    | TransformedSpecificClusterTaskProps;

export type InvalidUserInput<T> = {
    property: keyof T;
    expected: string | number;
};

export type ValidationAnswer<T> =
    | { type: "Valid" }
    | { type: "Error"; info: InvalidUserInput<T> };

export abstract class AbstractCreator<
    PropsType extends { [key: string]: any },
    PrimitiveType extends DBTaskPrimitiveType
> {
    public constructor(
        protected props: PropsType,
        protected readonly type: DBTaskPrimitiveType,
        protected context: Context,
        protected forceCreate: boolean,
        protected fileInfo: FileInfo
    ) {}

    protected models = () => this.context.models;
    protected logger = this.context.logger;

    protected baseValidateProps = (
        type: PrimitiveType,
        algo: string
    ): ValidationAnswer<PropsType> => {
        if (!allowedAlgorithms.has(type)) {
            throw new ApolloError(`Allowed algorithms for type '${type}' not found`);
        }
        if (allowedAlgorithms.get(type)!.algorithms.some(({ name }) => algo === name)) {
            return { type: "Valid" };
        }
        const expectedAlgorithms = allowedAlgorithms
            .get(type)!
            .algorithms.map(({ name }) => name);
        const expected = `[${expectedAlgorithms.join(", ")}]`;
        return {
            type: "Error",
            info: {
                property: "algorithmName",
                expected,
            },
        };
    };

    abstract getSchema(): SchemaType<PropsType, PrimitiveType>;

    public beforeValidation = async () => {
        return;
    };

    public validateProps = async () => {
        await this.beforeValidation();
        const base = this.baseValidateProps(this.props.type, this.props.algorithmName);
        if (base.type === "Error") {
            return base;
        }
        for (const { info, isValid } of this.getSchema()) {
            if (!(await isValid(this.props, this.fileInfo, this.context))) {
                return {
                    type: "Error" as const,
                    info,
                };
            }
        }
        return { type: "Valid" as const };
    };

    private findSimilarTask = async () => {
        const SpecificConfigModelName = `${this.type}Config` as const;
        const { algorithmName, type, ...rest } = this.props;
        const props = {
            ...rest,
        };
        const generalInclude = {
            model: GeneralTaskConfig,
            where: { algorithmName, fileID: this.fileInfo.fileID },
        };
        const include =
            type !== "Stats"
                ? [
                      { association: SpecificConfigModelName, where: { ...props } },
                      generalInclude,
                  ]
                : [generalInclude];
        // @ts-ignore
        const specificConfigs = await this.models().TaskState.findAll({ include });
        if (specificConfigs.length === 0) {
            return null;
        }
        return specificConfigs[0];
    };

    private saveToDB = async () => {
        const status: TaskStatusType = "ADDING_TO_DB";
        const userID = this.context.sessionInfo?.userID;
        const { fileID } = this.fileInfo;
        const taskState = await this.context.models.TaskState.create({
            status,
            userID,
        });
        await taskState.$create("baseConfig", {
            ...this.props,
            fileID,
        });
        await taskState.$create(`${this.type}Config`, { ...this.props });
        await taskState.$create(`${this.type}Result`, {});
        return taskState;
    };

    private createTask = async () => {
        // TODO: Refactor this later...
        if (this.type === "Stats") {
            const fileFormat = await this.fileInfo.$get("fileFormat");
            if (fileFormat) {
                throw new UserInputError("Incorrect file format for mining statistics!");
            }
        }
        if (!this.forceCreate) {
            const similarTask = await this.findSimilarTask();
            if (similarTask) {
                const state = await this.context.models.TaskState.findByPk(
                    similarTask.taskID
                );
                return state!;
            }
        }
        const task = await this.saveToDB();
        const { taskID } = task;

        await this.fileInfo.recomputeNumberOfUses();
        await produce({ taskID }, this.context.topicNames.tasks);
        task.status = "ADDED_TO_THE_TASK_QUEUE";
        await task.save();
        return task;
    };

    public processTask = async () => {
        const validationAnswer = await this.validateProps();
        if (validationAnswer.type === "Error") {
            const { info } = validationAnswer;
            const { expected, property } = info;
            const errorMessage =
                `Received incorrect property '${String(property)}'. ` +
                `Expected: ${expected}'`;
            throw new UserInputError(errorMessage, { info });
        }
        return await this.createTask();
    };
}

class MainPrimitiveCreator extends AbstractCreator<
    IntersectionMainTaskProps,
    MainPrimitiveType
> {
    public getSchema = () => getMainTaskSchema(this.props.type);
}

abstract class SpecificPrimitiveCreator extends AbstractCreator<
    TransformedIntersectionSpecificTaskProps,
    SpecificPrimitiveType
> {
    getSchema = () => getSpecificTaskSchema(this.props.type);
}

class TypoClusterCreator extends SpecificPrimitiveCreator {
    public beforeValidation = async () => {
        const { radius, ratio } = this.props;
        if (radius != undefined && ratio != undefined) {
            return;
        }
        if (!this.props.parentTaskID) {
            return;
        }
        const parentSpecificConfig = await this.models().TypoFDTaskConfig.findByPk(
            this.props.parentTaskID
        );
        if (!parentSpecificConfig) {
            return;
        }
        const { defaultRadius, defaultRatio } = parentSpecificConfig;
        this.props.radius = radius || defaultRadius;
        this.props.ratio = ratio || defaultRatio;
    };
}

class SpecificClusterCreator extends AbstractCreator<
    TransformedSpecificClusterTaskProps,
    "SpecificTypoCluster"
> {
    getSchema(): SchemaType<TransformedSpecificClusterTaskProps, "SpecificTypoCluster"> {
        return getSpecificClusterTaskSchema();
    }
}

const isIntersectionMainTaskProps = (
    props: PropsType
): props is IntersectionMainTaskProps => {
    return isMainPrimitiveType(props.type);
};

const isIntersectionSpecificTaskProps = (
    props: PropsType
): props is TransformedIntersectionSpecificTaskProps => {
    return isSpecificPrimitiveType(props.type);
};

const isSpecificClusterTaskProps = (
    props: PropsType
): props is TransformedSpecificClusterTaskProps => {
    return props.type === "SpecificTypoCluster";
};

export class TaskCreatorFactory {
    public static getSpecificPrimitiveConstructor = (props: PropsType) => {
        if ("type" in props) {
            if (isSpecificPrimitiveType(props.type)) {
                switch (props.type) {
                    case "TypoCluster":
                        return TypoClusterCreator;
                }
            }
        }
        throw new ApolloError("Unreachable code");
    };

    public static transformRawProps = (props: RawPropsType): PropsType => {
        let transformedProps: PropsType | undefined;
        if (props.type === "TypoCluster") {
            const { typoFD, ...rest } = props;
            transformedProps = { ...rest, typoFD: typoFD?.join(",") };
        } else {
            transformedProps = { ...props };
        }
        return transformedProps;
    };

    public static build = async (
        type: DBTaskPrimitiveType,
        context: Context,
        rawProps: RawPropsType,
        fileInfo: FileInfo,
        forceCreate = false
    ) => {
        if (type === "Stats") {
            forceCreate = false;
        }
        const props = this.transformRawProps(rawProps);
        const otherProps = [type, context, forceCreate, fileInfo] as const;
        const creatorInstance = await (async () => {
            if (isIntersectionMainTaskProps(props)) {
                return new MainPrimitiveCreator(props, ...otherProps);
            } else if (isSpecificClusterTaskProps(props)) {
                return new SpecificClusterCreator(props, ...otherProps);
            } else if (isIntersectionSpecificTaskProps(props)) {
                const TaskCreatorConstructor =
                    this.getSpecificPrimitiveConstructor(props);
                return new TaskCreatorConstructor(props, ...otherProps);
            }
            throw new ApolloError("Unreachable code");
        })();
        return await creatorInstance.processTask();
    };
}
