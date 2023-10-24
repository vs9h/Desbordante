import { QueryTypes } from "sequelize";
import { sequelize } from "../../../db/sequelize";

const isTimestampValid = (timestamp: string) => {
    return !isNaN(Date.parse(timestamp));
};

export async function aggregationQuery<TColumns extends string>(config: {
    from?: string | null;
    fromDefault: string;
    to?: string | null;
    toDefault: string;
    granularity: string;
    columns: (entryStart: string, entryEnd: string) => Record<TColumns, string>;
}): Promise<
    Array<
        { from: string; to: string } & {
            [Column in TColumns]: any;
        }
    >
> {
    const { from, fromDefault, to, toDefault, granularity, columns } = config;
    const min =
        from && isTimestampValid(from) ? `timextamptz '${from}'` : `(${fromDefault})`;
    const max = to && isTimestampValid(to) ? `timextamptz '${to}'` : `(${toDefault})`;
    const interval = `interval '1 (${granularity})'`;

    const entryStart = "timestamp";
    const entryEnd = `${entryStart} + ${interval}`;
    const timestampSeries = `generate_series(${min}, ${max}, ${interval})`;

    const subqueries = columns(entryStart, entryEnd);

    const query = `
        SELECT
        ${entryStart} AS "from",
        ${entryEnd} AS "to",
        ${Object.entries<string>(subqueries)
            .map(([columnName, query]) => `(${query}) AS "${columnName}"`)
            .join(",\n")}
        FROM ${timestampSeries} AS ${entryStart};
    `;

    return await sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
    });
}
