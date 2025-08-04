"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../types/event");
const _emojis_1 = __importDefault(require("#emojis"));
class default_1 extends event_1.BotEvent {
    name = "messageCreate";
    once = false;
    runner(bot, message) {
        const isValidMessageTrigger = message.inGuild() && !message.author.bot;
        if (!isValidMessageTrigger)
            return;
        if (message.content === bot.user.toString())
            return message.reply({
                content: `> ${_emojis_1.default.icons_info} ${_emojis_1.default.icons_text5} Olá ${message.author}, eu sou a **Kaori!** Todos os **meus comandos** estão em ${_emojis_1.default.icons_supportscommandsbadge} **[ \`Slash Commands\` ]**.`
                    + `\n-# ${_emojis_1.default.icons_text1} Experimente digitar / para ver meus comandos.`
            });
    }
}
exports.default = default_1;
