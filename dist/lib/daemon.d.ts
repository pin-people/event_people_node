import { Config } from './config';
export declare class Daemon {
    static config: typeof Config;
    /**
     * Starts the global listener Manager and BindSignals
     * @returns void
     */
    static start(): void;
    /**
     * Start the system interuptions management processes
     * @returns  void
     */
    static bindSignals(): void;
    /**
     * Look for message broker connection and call his closeConnection
     * @returns void
     */
    static stop(): void;
}
//# sourceMappingURL=daemon.d.ts.map