"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
class ShopCommand extends command_1.SlashCommand {
    name = "shop";
    description = "Utilize esse comando para utilizar a loja.";
    options = [];
    haveSubCommands = true;
    useDatabase = true;
    async run(bot, interaction) {
        await super.resolveSubCommand(bot, interaction);
    }
}
exports.default = ShopCommand;
