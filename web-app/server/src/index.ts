import { Application } from "express";
import { HttpError } from "http-errors";
import config from "./config";
import { configureApp } from "./configureApp";
import debug from "debug";
import http from "http";

(() => {
    configureApp()
        .then(async (app) => {
            await configureServer(app);
        })
        .catch((err) => {
            console.error(`App wasn't configured successfully:\n${err.message}`);
        });
})();

const configureServer = async (app: Application) => {
    const server = http.createServer(app);
    const { host, port } = config.hosts.server;
    server.listen(port, () => {
        console.log(`App listening at http://${host}:${port}`);
    });
    server.on("error", (error: HttpError) => {
        if (error.syscall !== "listen") {
            throw error;
        }
        switch (error.code) {
            case "EACCES":
                console.error(port + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(port + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on("listening", () => {
        const address = server.address();
        if (address === null) {
            throw Error("FATAL SERVER ERROR");
        }
        const bind =
            typeof address === "string" ? "pipe " + address : "port " + address.port;
        debug("Listening on " + bind);
    });
};
