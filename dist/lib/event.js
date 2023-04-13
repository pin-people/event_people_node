"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const config_1 = require("./config");
const errors_1 = require("./utils/errors");
class Event {
    name;
    body;
    schemaVersion;
    headers;
    constructor(name, body, schemaVersion = 1.0) {
        this.name = name;
        this.body = body;
        this.schemaVersion = schemaVersion;
    }
    /**
     * Constructs eventPayload, containing headers and the body for this event
     * @returns {EventPayload} - EventPayload
     */
    payload() {
        return {
            headers: this.getHeaders(),
            body: this.body,
        };
    }
    /**
     * Returns the event body
     * @returns {Record<any, string>} - Record<any, string> | string
     */
    getBody() {
        return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
    /**
     * Returns full event name
     * @returns {string} - string
     */
    getName() {
        return this.name;
    }
    /**
     * Builds the headers based on the app_name and event name and schemaVersion
     * @returns {EventHeaders} - EventHeaders
     */
    getHeaders() {
        const headerSpec = this.name.split('.');
        this.headers = {
            appName: config_1.Config.APP_NAME,
            resource: headerSpec[0],
            origin: headerSpec[1],
            action: headerSpec[2],
            destination: headerSpec[3],
            schemaVersion: this.schemaVersion,
        };
        return this.headers;
    }
    /**
     * Normalizes the event name based on the size of eventName
     * @param {string} eventName
     * @param {string} postFix
     * @returns string
     */
    static fixedEventName(eventName, postFix) {
        const split = eventName.split('.');
        const parts = split.length;
        if (parts < 3)
            throw new errors_1.MissingAttributeError(errors_1.INVALID_EVENT_NAME);
        if (parts > 3)
            return eventName;
        else {
            const baseName = `${split.splice(0, 3).join('.')}`;
            eventName = `${baseName}.${postFix}`;
        }
        return eventName;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map