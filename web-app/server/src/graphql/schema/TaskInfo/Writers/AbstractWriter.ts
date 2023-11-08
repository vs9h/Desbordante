import "jspdf-autotable";
import { Ar, Cfd, DownloadingTaskProps, Fd, Mfd } from "../../../types/types";
import { ApolloError } from "apollo-server-core";
import config from "../../../../config";
import { createArrayCsvWriter } from "csv-writer";
import { jsPDF } from "jspdf";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export type TransformedDep = (string | number | boolean)[];

export abstract class AbstractWriter<T extends Fd | Cfd | Ar | Mfd> {
    protected header: string[];
    protected static colDelimiter = "|";
    protected constructor(protected deps: T[], protected props: DownloadingTaskProps) {
        if (deps.length === 0) {
            throw new ApolloError(
                "Results cannot be written when an empty primitives list is received"
            );
        }
    }

    abstract transformDep(dep: T): TransformedDep;

    public async writeFileAndGetUrl(): Promise<string> {
        const records = this.deps.map(this.transformDep);
        const fileID = uuidv4();
        const { protocol, host, port } = config.hosts.server;
        const fileName = `${fileID}.${this.props.extension.toLowerCase()}`;
        const resultsPath = path.resolve(config.directories.results, `${fileName}`);

        await this.write(records, resultsPath);
        return `${protocol}://${host}:${port}/${config.directories.results}/${fileName}`;
    }

    protected async write(records: TransformedDep[], path: string) {
        if (this.props.extension === "CSV") {
            const writer = createArrayCsvWriter({
                path,
                header: this.header,
            });

            await writer.writeRecords(records).catch((reason) => {
                throw new ApolloError(reason);
            });
        } else if (this.props.extension === "PDF") {
            const doc = new jsPDF();
            (doc as any).autoTable({
                head: [this.header],
                body: records,
                theme: "grid",
                styles: { halign: "center" },
                headStyles: { fillColor: "#6C35C7" },
                alternateRowStyles: { fillColor: "#E6E6FA" },
                tableLineColor: "#6C35C7",
                tableLineWidth: 0.1,
            });

            doc.save(path);
        }
    }
}
