"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const _emojis_1 = __importDefault(require("#emojis"));
const models_1 = require("../../models");
class PingCommand extends command_1.SlashCommand {
    name = "ping";
    description = "Utilize esse comando para ver minha latência.";
    options = [];
    haveSubCommands = false;
    async run(bot, interaction) {
        let startTimestamp = Date.now();
        await interaction.deferReply();
        const apiLatency = Date.now() - startTimestamp;
        const gatewayLatency = bot.ws.ping;
        startTimestamp = Date.now();
        await models_1.db.user.find({});
        const databaseLatency = Date.now() - startTimestamp;
        return interaction.editReply({
            content: `${_emojis_1.default.icons_pong} ${_emojis_1.default.icons_text5} **Pong!** ${interaction.user}, veja **logo abaixo** minha **latência**: ` +
                `\n> - ${_emojis_1.default.icons_clock} ${_emojis_1.default.icons_text6} **Gateway**: \`${gatewayLatency}ms\`` +
                `\n> - ${_emojis_1.default.icons_spark} ${_emojis_1.default.icons_text6} **Api**: \`${apiLatency}ms\`` +
                `\n> - ${_emojis_1.default.icons_box} ${_emojis_1.default.icons_text6} **Database**: \`${databaseLatency}ms\``
        });
    }
}
exports.default = PingCommand;
