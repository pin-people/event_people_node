"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitContext = void 0;
class RabbitContext {
    channel;
    message;
    constructor(channel, message) {
        this.channel = channel;
        this.message = message;
    }
    success() {
        this.channel.ack(this.message, false);
    }
    fail() {
        this.channel.nack(this.message, false, true);
    }
    reject() {
        this.channel.reject(this.message, false);
    }
}
exports.RabbitContext = RabbitContext;
//# sourceMappingURL=rabbit-context.js.map