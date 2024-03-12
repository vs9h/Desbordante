import {
    getFindOptionsFromProps,
    getQueryFromRangeFilter,
    getQueryFromSearchFilter,
} from "../util";
import { AuthenticationError } from "apollo-server-express";
import { ForbiddenError } from "apollo-server-core";
import { Resolvers } from "../../types/types";
import { User } from "../../../db/models/UserData/User";

export const MetaInfoResolvers: Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }

            if (!sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User doesn't have permissions");
            }

            const options = getFindOptionsFromProps(
                props,
                {
                    searchString: (value) => ({
                        originalFileName: getQueryFromSearchFilter(value),
                    }),
                    includeBuiltIn: (value) => ({ isBuiltIn: value }),
                    period: (value) => ({
                        createdAt: getQueryFromRangeFilter(value),
                    }),
                    fileSize: (value) => ({
                        fileSize: getQueryFromRangeFilter(value),
                    }),
                },
                {
                    FILE_NAME: "\"originalFileName\"",
                    FILE_SIZE: "\"fileSize\"",
                    CREATION_TIME: "\"createdAt\"",
                    USER: "\"userID\"",
                },
                ["includeDeleted"]
            );

            return await models.FileInfo.findAll({
                ...options,
                include: User,
                paranoid: props.filters?.includeDeleted ?? false,
                logging: console.log,
            });
        },
    },
};
