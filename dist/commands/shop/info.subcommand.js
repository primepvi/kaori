"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const kompozr_1 = require("kompozr");
const _emojis_1 = __importDefault(require("#emojis"));
const shop_json_1 = __importDefault(require("../../constants/shop.json"));
class ShopInfoCommand extends command_1.SubSlashCommand {
    reference = "shop";
    name = "info";
    description = "Utilize esse comando para entrar na loja.";
    options = [];
    async run(bot, interaction) {
        const guild = await bot.guilds.fetch(interaction.guildId);
        const command = guild.commands.cache.find(c => c.name === "shop");
        if (!command)
            throw new Error("Unexpected error has ocurred..");
        const ItemSection = kompozr_1.k.fragment((item) => {
            const emoji = _emojis_1.default[item.emoji];
            const operationEmoji = item.operation === "buy" ? _emojis_1.default.icons_djoin : _emojis_1.default.icons_dleave;
            return [`> ${operationEmoji} ${emoji} ${_emojis_1.default.icons_text5} **${item.display}**:`
                    + `\n> -# ${_emojis_1.default.icons_text1} ${_emojis_1.default.icons_coin} **Preço: ${item.price}**`, kompozr_1.k.separator.smallHidden];
        });
        const itemsDisplay = ItemSection(Object.values(shop_json_1.default)).flat(2);
        itemsDisplay.pop();
        const container = kompozr_1.k.container({
            color: "Aqua",
            components: [
                kompozr_1.k.section({
                    accessory: kompozr_1.k.thumbnail({ url: "https://cdn.discordapp.com/emojis/1347627699773898888.png" }),
                    components: [kompozr_1.k.text(`# ${_emojis_1.default.icons_marketcart} — Lojinha da Kaori`, `-# ${_emojis_1.default.icons_text1} Aqui você pode comprar e vender seus itens.`, `> ${_emojis_1.default.icons_djoin} **Comprar**: </shop buy:${command.id}> \`<item> <quantidade?>\``, `> ${_emojis_1.default.icons_dleave} **Vender**: </shop sell:${command.id}> \`<item> <quantidade?>\``)]
                }),
                kompozr_1.k.separator.small,
                `## ${_emojis_1.default.icons_todolist} — Catálogo`,
                ...itemsDisplay,
            ]
        });
        return interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"]
        });
    }
}
exports.default = ShopInfoCommand;
