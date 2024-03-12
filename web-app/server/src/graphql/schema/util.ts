import {
    FindOptions,
    Op,
    WhereAttributeHashValue,
    WhereOptions,
    literal,
} from "sequelize";
import { OrderDirection, Pagination } from "../types/types";

type AbstractQueryProps<FilterName extends string, OrderingParameter extends string> = {
    filters?: Partial<Record<FilterName, any>>;
    ordering?: {
        parameter: OrderingParameter;
        direction: OrderDirection;
    };
    pagination?: Pagination;
};

export const getFindOptionsFromProps = <
    TFilterName extends string = string,
    TOrderingParameterName extends string = string,
    TProps extends AbstractQueryProps<
        TFilterName,
        TOrderingParameterName
    > = AbstractQueryProps<TFilterName, TOrderingParameterName>
>(
    { filters, ordering, pagination }: TProps,
    mapFilterPropsToOptions: Record<TFilterName, (value: any) => WhereOptions>,
    mapOrderingParameterToAttibute: Record<TOrderingParameterName, string>,
    exclude?: string[]
) => {
    let options: FindOptions = {};

    if (pagination) {
        options = { ...options, ...pagination };
    }

    if (filters) {
        const where = Object.entries(filters).reduce<WhereOptions>(
            (acc, [filterName, filterValue]) => {
                if (exclude?.includes(filterName as TFilterName)) {
                    return acc;
                }

                const mapping =
                    mapFilterPropsToOptions[filterName as TFilterName] ?? filterName;

                if (!mapping) {
                    return {
                        ...acc,
                        [filterName]: filterValue,
                    };
                }

                return {
                    ...acc,
                    ...mapping(filterValue),
                };
            },
            {}
        );

        options = { ...options, where };
    }

    if (ordering) {
        const order = [
            [
                literal(mapOrderingParameterToAttibute[ordering.parameter]),
                ordering.direction,
            ],
        ] as any;

        options = { ...options, order };
    }

    return options;
};

export const getQueryFromRangeFilter = <TValue extends string | number>(filter: {
    from?: TValue;
    to?: TValue;
}): WhereAttributeHashValue<any> => {
    const { from, to } = filter;

    if (from !== undefined && to !== undefined) {
        return { [Op.between]: [from, to] };
    }

    if (from !== undefined) {
        return { [Op.gte]: from };
    }

    if (to !== undefined) {
        return { [Op.lte]: to };
    }

    return {};
};

export const getQueryFromSearchFilter = (
    filter: string
): WhereAttributeHashValue<any> => {
    return { [Op.like]: `%${filter}%` };
};
