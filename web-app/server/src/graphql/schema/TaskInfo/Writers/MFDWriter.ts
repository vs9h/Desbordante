import { AbstractWriter, TransformedDep } from "./AbstractWriter";
import { DownloadingTaskProps, Mfd } from "../../../types/types";

export class MFDWriter extends AbstractWriter<Mfd> {
    public constructor(deps: Mfd[], props: DownloadingTaskProps) {
        super(deps, props);
        this.header = [
            "index",
            "withinLimit",
            "maximumDistance",
            "furthestPointIndex",
            "value",
            "clusterValue",
        ];
    }

    transformDep(dep: Mfd): TransformedDep {
        return [
            dep.index,
            dep.withinLimit,
            dep.maximumDistance,
            dep.furthestPointIndex,
            dep.value,
            dep.clusterValue,
        ];
    }
}
