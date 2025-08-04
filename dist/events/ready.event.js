"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@kauzx/logger");
const event_1 = require("../types/event");
class default_1 extends event_1.BotEvent {
    name = 'ready';
    once = true;
    runner(_, client) {
        logger_1.logger.success(`Bot online com sucesso: ${client.user.username}.`);
    }
}
exports.default = default_1;
