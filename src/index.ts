import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import { Socket } from "net";

type AddressInfo = { address: string, family: 4 | 6; };
type LookupCallback<T extends string | AddressInfo[]> = (
    err: NodeJS.ErrnoException,
    address: T,
    family?: 4 | 6
) => void;


export function shim<T extends HttpAgent | HttpsAgent>(
    installer: Function,
    agent: T & {
        createConnection?: (options: any, callback: Function) => Socket;
        _createConnection?: (options: any, callback: Function) => Socket;
    },
    family: 0 | 4 | 6 = 0
): T {
    // https://github.com/nodejs/node/blob/8713c83462df192dbf319e4ac0c2640b3a8cfff7/lib/net.js#L216
    if (typeof agent.createConnection === "function") {
        if (!("_createConnection" in agent)) {
            agent["_createConnection"] = agent.createConnection;
            agent.createConnection = function (options, callback) {
                const abortController = new AbortController();
                if (!options["lookup"]) {
                    options["lookup"] = function (
                        hostname: string,
                        options: any,
                        cb: LookupCallback<string>
                    ) {
                        // Preferable place to pass in abort signal
                        return installer(hostname, options["family"] ?? family, abortController.signal, cb);
                    };
                }
                const socket = agent["_createConnection"]!(options, callback);
                socket.once("timeout", () => abortController.abort(new Error("Socket timeout")));
                socket.once("error", (err: Error) => abortController.abort(err));
                return socket;
            };
        }
        return agent;
    } else {
        throw new TypeError("Cannot install lookup function on the given agent");
    }
}