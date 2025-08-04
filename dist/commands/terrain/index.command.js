"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
class TerrainCommand extends command_1.SlashCommand {
    name = "terrain";
    description = "Utilize esse comando para gerenciar seus terrenos.";
    options = [];
    useDatabase = true;
    haveSubCommands = true;
    async run(bot, interaction) {
        await super.resolveSubCommand(bot, interaction);
    }
}
exports.default = TerrainCommand;
