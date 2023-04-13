"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = void 0;
const config_1 = require("./config");
const errors_1 = require("./utils/errors");
class Emitter {
    /**
     *Emits each passed event, calling broker produce method
     * @param {Event[]} events - Array of events to emitt
     */
    static trigger(...events) {
        events.forEach((event, index) => {
            if (!event.getBody())
                throw new errors_1.MissingAttributeError(`Event body on position ${index}`);
            if (!event.getName())
                throw new errors_1.MissingAttributeError(`Event name on position ${index}`);
            config_1.Config.broker.produce(event);
        });
    }
}
exports.Emitter = Emitter;
//# sourceMappingURL=emitter.js.map