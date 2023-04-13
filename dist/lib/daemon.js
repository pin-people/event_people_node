"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Daemon = void 0;
const config_1 = require("./config");
const listeners_1 = require("./listeners");
class Daemon {
    static config = config_1.Config;
    /**
     * Starts the global listener Manager and BindSignals
     * @returns void
     */
    static start() {
        listeners_1.ListenersManager.bindAllListeners();
        Daemon.bindSignals();
    }
    /**
     * Start the system interuptions management processes
     * @returns  void
     */
    static bindSignals() {
        process.stdin.resume();
        process.on('exit', () => {
            console.log('stopped due to exit system');
            Daemon.stop();
            process.exit(0);
        });
        process.on('SIGINT', () => {
            console.log('stopped due to CTRL+C');
            process.exit();
        });
    }
    /**
     * Look for message broker connection and call his closeConnection
     * @returns void
     */
    static stop() {
        if (Daemon.config.broker.connection)
            Daemon.config.broker.closeConnection();
    }
}
exports.Daemon = Daemon;
//# sourceMappingURL=daemon.js.map