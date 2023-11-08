import { Ar, Cfd, DownloadingTaskProps, Fd, Mfd } from "../../../types/types";
import { ARWriter } from "./ARWriter";
import { ApolloError } from "apollo-server-core";
import { CFDWriter } from "./CFDWriter";
import { FDWriter } from "./FDWriter";
import { MFDWriter } from "./MFDWriter";
import { MainPrimitiveType } from "../../../../db/models/TaskData/configs/GeneralTaskConfig";

export const getSpecificWriter = (
    type: MainPrimitiveType,
    deps: Fd[] | Cfd[] | Ar[] | Mfd[],
    props: DownloadingTaskProps
) => {
    switch (type) {
        case "AR":
            return new ARWriter(deps as Ar[], props);
        case "FD" || "TypoFD":
            return new FDWriter(deps as Fd[], props);
        case "CFD":
            return new CFDWriter(deps as Cfd[], props);
        case "MFD":
            return new MFDWriter(deps as Mfd[], props);
    }
    throw new ApolloError(
        `Results for ${type} cannot be written, as it is not currently supported`
    );
};
