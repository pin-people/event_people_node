import { ListenerConfig } from './base-listener';
export declare class ListenersManager {
    static listenerConfigurations: ListenerConfig[];
    /**
     * For each listener added to listenerConfigurations, finds the right
     * method property on this listener attatched and use it as callback for the incoming event
     * @returns void
     */
    static bindAllListeners(): void;
    /**
     * Include listeners to the global listener configurations array
     * @param {ListenerConfig} config
     * @returns void
     */
    static registerListenerConfiguration(config: ListenerConfig): void;
    /**
     * Return all ListenerConfig from the global array
     * @returns {ListenerConfig[]} ListenerConfig[]
     */
    static getListenerConfigurations(): ListenerConfig[];
}
//# sourceMappingURL=listeners-manager.d.ts.map