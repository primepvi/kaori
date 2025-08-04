"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../../types/command");
const shop_json_1 = __importDefault(require("../../constants/shop.json"));
const _emojis_1 = __importDefault(require("#emojis"));
const models_1 = require("../../models");
const util_stunks_1 = require("util-stunks");
const sellItemChoices = Object.values(shop_json_1.default)
    .filter(item => item.operation === "sell")
    .map(item => ({ name: item.display, value: item.id }));
class ShopSellSubCommand extends command_1.SubSlashCommand {
    reference = "shop";
    name = "sell";
    description = "Utilize esse comando para vender um item na loja.";
    options = [
        {
            name: "item",
            description: "Insira aqui o nome do item que deseja comprar.",
            type: discord_js_1.ApplicationCommandOptionType.String,
            choices: sellItemChoices,
            required: true
        },
        {
            name: "quantity",
            description: "Insira aqui a quantidade de item que deseja comprar.",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1,
        }
    ];
    async run(_, interaction) {
        const itemId = interaction.options.getString("item", true);
        const itemData = shop_json_1.default[itemId];
        const itemQuantity = interaction.options.getInteger("quantity") ?? 1;
        const itemEmoji = _emojis_1.default[itemData.emoji];
        const itemDisplay = `${itemEmoji}  **[ \`${itemData.display}\` ]**`;
        const userItem = await models_1.db.item.findOne({ id: itemId, owner: interaction.user.id });
        if (!userItem || userItem.quantity < itemQuantity)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${itemQuantity}\` ${itemDisplay} para **vender**.`
            });
        const price = itemData.price * itemQuantity;
        await models_1.db.user.findByIdAndUpdate(interaction.user.id, {
            $inc: { coins: price }
        });
        userItem.quantity -= itemQuantity;
        await userItem.save();
        return interaction.reply(`> ${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Vendido!** ${interaction.user}, você **vendeu** com **sucesso** \`x${itemQuantity}\` ${itemDisplay} por \`${(0, util_stunks_1.abbreviate)(price)}\` ${_emojis_1.default.icons_coin} **[ \`Moedas\` ]**!`);
    }
}
exports.default = ShopSellSubCommand;
