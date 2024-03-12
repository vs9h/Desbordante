import sequelize, { BOOLEAN, DATE, INTEGER, STRING, TEXT, UUID, UUIDV4 } from "sequelize";
import {
    BelongsTo,
    Column,
    ForeignKey,
    HasMany,
    HasOne,
    IsUUID,
    Model,
    Table,
} from "sequelize-typescript";
import {
    BuiltInDatasetInfoType,
    builtInDatasets,
    getPathToBuiltInDataset,
} from "../../initBuiltInDatasets";
import { CsvParserStream, parse } from "fast-csv";
import { FileProps, Column as SchemaColumn } from "../../../graphql/types/types";
import {
    SingularFileFormatProps,
    TabularFileFormatProps,
    createTabularFileFromSingular,
    findRowsAndColumnsNumber,
} from "../../../graphql/schema/TaskCreating/csvValidator";
import { ApolloError } from "apollo-server-core";
import { FileFormat } from "./FileFormat";
import { GeneralTaskConfig } from "../TaskData/configs/GeneralTaskConfig";
import { Row } from "@fast-csv/parse";
import { User } from "../UserData/User";
import config from "../../../config";
import { finished } from "stream/promises";
import fs from "fs";
import { generateHeaderByPath } from "../../../graphql/schema/TaskCreating/generateHeader";
import path from "path";
import validator from "validator";
import isUUID = validator.isUUID;

interface FileInfoModelMethods {
    getColumnNames: () => string[];
    getColumns: () => SchemaColumn[];
    getPath: () => string;
}

@Table({
    paranoid: true,
    updatedAt: false,
    createdAt: false,
    tableName: "FilesInfo",
})
export class FileInfo extends Model implements FileInfoModelMethods {
    @IsUUID(4)
    @Column({
        type: UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
    })
    fileID!: string;

    @Column({ type: DATE, allowNull: false, defaultValue: sequelize.fn("NOW") })
    createdAt!: string;

    @ForeignKey(() => User)
    @Column({ type: UUID, allowNull: true })
    userID!: string | null;

    @BelongsTo(() => User)
    user!: User | null;

    @HasMany(() => GeneralTaskConfig)
    baseConfigs?: [GeneralTaskConfig];

    @HasOne(() => FileFormat)
    fileFormat?: FileFormat;

    @Column({ type: BOOLEAN, defaultValue: false, allowNull: false })
    isBuiltIn!: boolean;

    @Column({ type: BOOLEAN, defaultValue: true, allowNull: false })
    isValid!: boolean;

    @Column({ type: STRING, allowNull: true })
    mimeType!: string | null;

    @Column({ type: INTEGER, allowNull: true })
    fileSize!: number;

    @Column({ type: STRING })
    encoding!: string | null;

    @Column({ type: TEXT, allowNull: true })
    fileName!: string;

    @Column({ type: TEXT, allowNull: false })
    originalFileName!: string;

    @Column({ type: BOOLEAN, allowNull: false })
    hasHeader!: boolean;

    @Column({ type: STRING, allowNull: false })
    delimiter!: string;

    @Column({ type: TEXT })
    renamedHeader!: string;

    @Column({ type: INTEGER, allowNull: true })
    rowsCount!: number;

    @Column({ type: INTEGER, allowNull: true })
    countOfColumns?: number;

    @Column({ type: STRING, unique: true })
    path!: string;

    static getPathToMainFile = () => {
        if (!require.main) {
            throw new ApolloError("Cannot find main");
        }
        return path.dirname(require.main.filename).split("/");
    };

    static getPathToUploadedDataset = (fileName: string) => `/server/uploads/${fileName}`;

    static resolvePath = (path: string, isBuiltIn: boolean) => {
        if (config.inContainer) {
            return path;
        } else {
            const prefix = FileInfo.getPathToMainFile().slice(0, -3).join("/");
            const postfix = isBuiltIn ? "datasets" : "uploads";
            return `${prefix}/volumes/${postfix}/${path.split("/").pop()}`;
        }
    };

    getPath = () => FileInfo.resolvePath(this.path, this.isBuiltIn);

    generateHeader = async () => {
        const file = await FileInfo.findByPk(this.fileID);
        if (!file) {
            throw new ApolloError("File not found");
        }
        const { hasHeader, delimiter } = file;
        return await generateHeaderByPath(file.getPath(), hasHeader, delimiter);
    };

    getColumnNames = () => JSON.parse(this.renamedHeader) as string[];
    getColumns = () => this.getColumnNames().map((name, index) => ({ name, index }));

    static getColumnNamesForFile = async (fileID: string) => {
        if (!isUUID(fileID, 4)) {
            throw new ApolloError("Incorrect fileID");
        }
        const file = await FileInfo.findByPk(fileID, {
            attributes: ["renamedHeader"],
        });
        if (!file) {
            throw new ApolloError("File not found");
        }
        return file.getColumnNames();
    };

    static saveBuiltInDataset = async (props: BuiltInDatasetInfoType) => {
        const { fileName, datasetProps } = props;
        const withFileFormat = props.datasetProps.inputFormat != null;
        const isBuiltIn = true;

        const dbPath = getPathToBuiltInDataset(props.fileName);
        const path = FileInfo.resolvePath(dbPath, isBuiltIn);
        const { hasHeader, delimiter } = datasetProps;
        const header = await generateHeaderByPath(path, hasHeader, delimiter);
        const renamedHeader = JSON.stringify(header);

        const [file, created] = await FileInfo.findOrCreate({
            where: { fileName, isBuiltIn, isValid: true },
            defaults: {
                path: dbPath,
                originalFileName: fileName,
                renamedHeader,
                hasHeader,
                delimiter,
            },
        });
        console.log(
            `Built in dataset ${fileName} ${created ? "was created" : "already exists"}`
        );
        if (!created) {
            return file;
        }
        const counters = await findRowsAndColumnsNumber(dbPath, isBuiltIn, delimiter);
        await file.update(counters);
        const { size: fileSize } = await fs.promises.stat(path);
        await file.update({
            fileSize,
        });

        if (withFileFormat) {
            await FileFormat.createFileFormatIfPropsValid(file, datasetProps);
        }
        return file;
    };

    static uploadDataset = async (
        datasetProps: FileProps,
        table: any,
        userID: string | null = null
    ) => {
        const isBuiltIn = false;
        const {
            createReadStream,
            filename: originalFileName,
            mimetype: mimeType,
            encoding,
        } = await table;

        const stream = createReadStream();
        const file = await FileInfo.create({
            ...datasetProps,
            encoding,
            mimeType,
            originalFileName,
            userID,
            isValid: false,
        });

        const { fileID } = file;
        const fileName = `${fileID}.csv`;
        const path = FileInfo.getPathToUploadedDataset(fileName);
        await file.update({ fileName, path });
        const newFilePath = `${
            (!config.inContainer && "../../volumes/") || ""
        }uploads/${fileName}`;
        const out = fs.createWriteStream(newFilePath);
        stream.pipe(out);
        await finished(out);

        const { size: fileSize } = await fs.promises.stat(newFilePath);
        await file.update({
            renamedHeader: JSON.stringify(await file.generateHeader()),
            fileSize,
        });

        if (datasetProps.inputFormat) {
            const fileFormat = await FileFormat.createFileFormatIfPropsValid(
                file,
                datasetProps
            );
            let specificFileFormat =
                datasetProps.inputFormat === "SINGULAR"
                    ? ({
                          inputFormat: "SINGULAR",
                          tidColumnIndex: datasetProps.tidColumnIndex,
                          itemColumnIndex: datasetProps.itemColumnIndex,
                      } as SingularFileFormatProps)
                    : ({
                          inputFormat: "TABULAR",
                          hasTid: datasetProps.hasTid,
                      } as TabularFileFormatProps);

            // Find rows count before creating new file
            let counters = await findRowsAndColumnsNumber(
                path,
                isBuiltIn,
                datasetProps.delimiter,
                specificFileFormat
            );
            await file.update(counters);

            if (datasetProps.inputFormat === "SINGULAR") {
                const newPath = await createTabularFileFromSingular(
                    path,
                    isBuiltIn,
                    datasetProps.delimiter,
                    datasetProps.tidColumnIndex!,
                    datasetProps.itemColumnIndex!
                );

                // Find rows count after creating file
                specificFileFormat = {
                    inputFormat: "TABULAR",
                    hasTid: true,
                } as TabularFileFormatProps;
                await fileFormat.update({
                    inputFormat: "TABULAR",
                    hasTid: true,
                });
                counters = await findRowsAndColumnsNumber(
                    newPath,
                    isBuiltIn,
                    datasetProps.delimiter,
                    specificFileFormat
                );
                await file.update({
                    path: newPath,
                    ...counters,
                    hasHeader: false,
                });
            }
        } else {
            const counters = await findRowsAndColumnsNumber(
                path,
                isBuiltIn,
                datasetProps.delimiter
            );
            await file.update(counters);
        }
        await file.update({ isValid: true });
        return file;
    };

    static GetRowsByIndices = async (
        fileInfo: {
            path: fs.PathLike;
            delimiter: string;
            hasHeader: boolean;
            isBuiltIn: boolean;
        },
        indices: number[]
    ): Promise<Map<number, string[]>> => {
        const sortedIndices = indices.sort((a, b) => a - b);
        const rows = new Map<number, string[]>();
        let curRowNum = sortedIndices[0];
        const { delimiter, hasHeader } = fileInfo;
        const path = FileInfo.resolvePath(fileInfo.path.toString(), fileInfo.isBuiltIn);

        return new Promise((resolve) => {
            const parser: CsvParserStream<Row, Row> = parse({
                delimiter: delimiter,
                skipRows: curRowNum + Number(hasHeader),
                maxRows: sortedIndices[sortedIndices.length - 1] - curRowNum + 1,
            });

            fs.createReadStream(`${path}`)
                .pipe(parser)
                .on("error", (e) => {
                    throw new ApolloError(`ERROR WHILE READING FILE:\n\r${e.message}`);
                })
                .on("data", (row) => {
                    if (sortedIndices.includes(curRowNum++)) {
                        rows.set(curRowNum - 1, row);
                    }
                })
                .on("end", () => {
                    resolve(rows);
                });
        });
    };

    static findBuiltInDatasets = async () => {
        const datasets = await FileInfo.findAll({
            where: { isBuiltIn: true, isValid: true },
        });
        return datasets.filter(({ fileName }) =>
            builtInDatasets.find((info) => info.fileName === fileName)
        );
    };

    static findBuiltInDataset = async (name: string) => {
        const datasets = await FileInfo.findBuiltInDatasets();
        const dataset = datasets.find(({ fileName }) => fileName === `${name}.csv`);
        if (!dataset) {
            throw new Error("File not found");
        }
        return dataset;
    };
}
