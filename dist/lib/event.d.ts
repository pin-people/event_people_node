export declare type EventHeaders = {
    appName: string;
    resource: string;
    origin: string;
    action: string;
    destination: string;
    schemaVersion: number;
};
export declare type EventPayload = {
    headers: EventHeaders;
    body: Record<string, any> | string;
};
export declare class Event {
    private name;
    private readonly body;
    private readonly schemaVersion;
    private headers;
    constructor(name: string, body: Record<string, any> | string, schemaVersion?: number);
    /**
     * Constructs eventPayload, containing headers and the body for this event
     * @returns {EventPayload} - EventPayload
     */
    payload(): EventPayload;
    /**
     * Returns the event body
     * @returns {Record<any, string>} - Record<any, string> | string
     */
    getBody(): Record<any, string>;
    /**
     * Returns full event name
     * @returns {string} - string
     */
    getName(): string;
    /**
     * Builds the headers based on the app_name and event name and schemaVersion
     * @returns {EventHeaders} - EventHeaders
     */
    getHeaders(): EventHeaders;
    /**
     * Normalizes the event name based on the size of eventName
     * @param {string} eventName
     * @param {string} postFix
     * @returns string
     */
    static fixedEventName(eventName: string, postFix: string): string;
}
//# sourceMappingURL=event.d.ts.map