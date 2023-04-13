"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVALID_EVENT_NAME = exports.MissingAttributeError = void 0;
class MissingAttributeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidParamError';
    }
}
exports.MissingAttributeError = MissingAttributeError;
exports.INVALID_EVENT_NAME = 'event name should match resource.origin.action or resource.origin.action.dest patterns';
//# sourceMappingURL=error-exceptions.js.map