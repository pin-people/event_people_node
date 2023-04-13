import { Event } from './event';
export declare class Emitter {
    /**
     *Emits each passed event, calling broker produce method
     * @param {Event[]} events - Array of events to emitt
     */
    static trigger(...events: Event[]): void;
}
//# sourceMappingURL=emitter.d.ts.map