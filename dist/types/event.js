"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotEvent = void 0;
class BotEvent {
    register(bot) {
        const operation = this.once ? 'once' : 'on';
        bot[operation](this.name, (...args) => this.runner(bot, ...args));
    }
}
exports.BotEvent = BotEvent;
