"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
const items_json_1 = __importDefault(require("../../constants/items.json"));
const kompozr_1 = require("kompozr");
class InventoryCommand extends command_1.SlashCommand {
    name = "inventory";
    description = "Utilize esse comando para ver seu inventário.";
    options = [];
    useDatabase = true;
    haveSubCommands = false;
    async run(_, interaction) {
        const userItems = (await models_1.db.item.find({ owner: interaction.user.id }))
            .filter(item => item.quantity > 0);
        if (!userItems || userItems.length <= 0)
            return interaction.reply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **não possui nenhum item** em seu **inventário**.`,
                flags: ["Ephemeral"]
            });
        const ItemSection = kompozr_1.k.fragment((rawItem) => {
            const item = items_json_1.default[rawItem.id];
            if (!item)
                return "";
            const emoji = _emojis_1.default[item.emoji];
            return `> - \`x${rawItem.quantity}\` ${emoji} **[ \`${item.display}\` ]**`;
        });
        return interaction.reply({
            content: `${_emojis_1.default.icons_backpack} ${_emojis_1.default.icons_text5} ${interaction.user}, **veja** logo **abaixo** seu **inventário**:\n` +
                ItemSection(userItems).join('\n')
        });
    }
}
exports.default = InventoryCommand;
