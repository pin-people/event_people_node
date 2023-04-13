"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseListener = void 0;
const listeners_manager_1 = require("./listeners-manager");
const config_1 = require("../config");
const __1 = require("..");
class BaseListener {
    context;
    constructor(context) {
        this.context = context;
    }
    /**
     * Address some method name for a event message and add it to global ListenerManager
     * @param {string} method - name for the class method tha will handle incoming events
     * @param {string} eventName - name for the queue event message
     */
    static bindEvent(method, eventName) {
        const appName = config_1.Config.APP_NAME;
        if (eventName.split('.').length <= 3) {
            listeners_manager_1.ListenersManager.registerListenerConfiguration({
                listener: this,
                method,
                eventName: __1.Event.fixedEventName(eventName, 'all'),
            });
            listeners_manager_1.ListenersManager.registerListenerConfiguration({
                listener: this,
                method,
                eventName: __1.Event.fixedEventName(eventName, appName),
            });
        }
        else
            listeners_manager_1.ListenersManager.registerListenerConfiguration({
                listener: this,
                method,
                eventName: __1.Event.fixedEventName(eventName, appName),
            });
    }
    /**
     * Confirm message delivery and make the handshake with the channel
     * @returns void
     */
    success() {
        this.context.success();
    }
    /**
     * Deny message delivery and handshake with the channel
     * @returns void
     */
    fail() {
        this.context.fail();
    }
    /**
     * Reject the message and handshake with the channel
     * @returns void
     */
    reject() {
        this.context.reject();
    }
}
exports.BaseListener = BaseListener;
//# sourceMappingURL=base-listener.js.map