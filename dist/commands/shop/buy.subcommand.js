"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
const util_stunks_1 = require("util-stunks");
const shop_json_1 = __importDefault(require("../../constants/shop.json"));
const buyItemChoices = Object.values(shop_json_1.default)
    .filter(item => item.operation === "buy")
    .map(item => ({ name: item.display, value: item.id }));
class ShopBuySubCommand extends command_1.SubSlashCommand {
    reference = "shop";
    name = "buy";
    description = "Utilize esse comando para comprar um item da loja.";
    options = [
        {
            name: "item",
            description: "Insira aqui o nome do item que deseja comprar.",
            type: discord_js_1.ApplicationCommandOptionType.String,
            choices: buyItemChoices,
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
        const userData = await models_1.db.user.findById(interaction.user.id);
        if (!userData)
            throw new Error("Unexpected error has ocurred.");
        const itemQuantity = interaction.options.getInteger("quantity") ?? 1;
        const itemId = interaction.options.getString("item", true);
        const item = shop_json_1.default[itemId];
        const itemEmoji = _emojis_1.default[item.emoji];
        const price = item.price * itemQuantity;
        if (price > userData.coins)
            return interaction.reply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **não tem moedas suficiente** para **efetuar essa compra**.`,
                flags: ["Ephemeral"]
            });
        await models_1.db.item.findOneAndUpdate({ owner: interaction.user.id, id: itemId }, {
            $setOnInsert: {
                id: itemId,
                owner: interaction.user.id,
            },
            $inc: { quantity: itemQuantity },
        }, { upsert: true, new: true });
        userData.coins -= price;
        await userData.save();
        return interaction.reply(`> ${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Comprado!** ${interaction.user}, você **comprou** com **sucesso** \`x${itemQuantity}\` ${itemEmoji} **[ \`${item.display}\` ]** por \`${(0, util_stunks_1.abbreviate)(price)}\` ${_emojis_1.default.icons_coin} **[ \`Moedas\` ]**!`);
    }
}
exports.default = ShopBuySubCommand;
