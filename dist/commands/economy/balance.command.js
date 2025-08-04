"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const util_stunks_1 = require("util-stunks");
const _emojis_1 = __importDefault(require("#emojis"));
class BalanceCommand extends command_1.SlashCommand {
    name = "balance";
    description = "Utilize esse comando para ver quantas moedas você possui na carteira.";
    options = [];
    haveSubCommands = false;
    async run(_, interaction) {
        const userData = await models_1.db.user.findById(interaction.user.id);
        if (!userData)
            throw new Error("Unexpected error has ocurred.");
        const balance = (0, util_stunks_1.abbreviate)(userData.coins);
        return interaction.reply(`> ${_emojis_1.default.icons_coin} ${_emojis_1.default.icons_text5} ${interaction.user}, você **possui** \`${balance}\` **moedas** em sua **carteira**.`);
    }
}
exports.default = BalanceCommand;
