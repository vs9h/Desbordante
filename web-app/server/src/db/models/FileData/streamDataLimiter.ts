import { UserInputError } from "apollo-server-core";
import { Transform, TransformCallback } from "stream";

export class FileSizeLimiter extends Transform {
    maxSize: number;
    currentSize = 0;

    constructor(maxSize: number) {
        super();
        this.maxSize = maxSize;
    }

    override _transform(
        chunk: any,
        encoding: BufferEncoding,
        callback: TransformCallback
    ) {
        this.currentSize += chunk.length;

        if (this.currentSize > this.maxSize) {
            this.destroy(
                new UserInputError(
                    `Remaining file size of ${this.maxSize} bytes exceeded`
                )
            );
            return;
        }

        this.push(chunk);
        callback();
    }
}
