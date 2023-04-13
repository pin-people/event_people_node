"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenersManager = void 0;
const listener_1 = require("../listener");
class ListenersManager {
    static listenerConfigurations = [];
    /**
     * For each listener added to listenerConfigurations, finds the right
     * method property on this listener attatched and use it as callback for the incoming event
     * @returns void
     */
    static bindAllListeners() {
        return ListenersManager.listenerConfigurations.forEach((config) => {
            listener_1.Listener.on(config.eventName, (event, context) => {
                const instance = new config.listener(context);
                instance[config.method](event);
            });
        });
    }
    /**
     * Include listeners to the global listener configurations array
     * @param {ListenerConfig} config
     * @returns void
     */
    static registerListenerConfiguration(config) {
        ListenersManager.listenerConfigurations.push(config);
    }
    /**
     * Return all ListenerConfig from the global array
     * @returns {ListenerConfig[]} ListenerConfig[]
     */
    static getListenerConfigurations() {
        return ListenersManager.listenerConfigurations;
    }
}
exports.ListenersManager = ListenersManager;
//# sourceMappingURL=listeners-manager.js.map