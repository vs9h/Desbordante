import { AuthenticationError } from "apollo-server-express";
import { FindOptions } from "sequelize";
import { ForbiddenError } from "apollo-server-core";
import { Resolvers } from "../../types/types";

export const MetaInfoResolvers: Resolvers = {
    Query: {
        datasets: async (parent, { props }, { models, sessionInfo }) => {
            if (!sessionInfo) {
                throw new AuthenticationError("User must be authorized");
            }
            if (!sessionInfo.permissions.includes("VIEW_ADMIN_INFO")) {
                throw new ForbiddenError("User doesn't have permissions");
            }

            const { includeBuiltInDatasets, includeDeletedDatasets, pagination } = props;
            let options: FindOptions = { where: { isValid: true }, ...pagination };

            if (includeBuiltInDatasets === false) {
                options.where = { ...options.where, isBuiltInDataset: false };
            }
            if (includeDeletedDatasets === true) {
                options = { ...options, paranoid: false };
            }

            return await models.FileInfo.findAll(options);
        },
    },
};
