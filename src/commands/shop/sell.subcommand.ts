import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand, SubSlashCommandOption } from "../../types/command";
import shopItems from "../../constants/shop.json";
import emojis from "#emojis";
import { db } from "../../models";
import { abbreviate } from "util-stunks";

const sellItemChoices = Object.values(shopItems)
    .filter(item => item.operation === "sell")
    .map(item => ({ name: item.display, value: item.id }));

export default class ShopSellSubCommand extends SubSlashCommand {
    public reference = "shop";
    public name = "sell";
    public description = "Utilize esse comando para vender um item na loja.";
    public options: SubSlashCommandOption[] = [
        {
            name: "item",
            description: "Insira aqui o nome do item que deseja comprar.",
            type: ApplicationCommandOptionType.String,
            choices: sellItemChoices,
            required: true
        },
        {
            name: "quantity",
            description: "Insira aqui a quantidade de item que deseja comprar.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1,
        }
    ];

    public async run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const itemId = interaction.options.getString("item", true);
        const itemData = shopItems[itemId as keyof typeof shopItems];
        const itemQuantity = interaction.options.getInteger("quantity") ?? 1;
        const itemEmoji = emojis[itemData.emoji as keyof typeof emojis];
        const itemDisplay = `${itemEmoji}  **[ \`${itemData.display}\` ]**`;

        const userItem = await db.item.findOne({ id: itemId, owner: interaction.user.id });
        if (!userItem || userItem.quantity < itemQuantity) return interaction.editReply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${itemQuantity}\` ${itemDisplay} para **vender**.`
        })

        const price = itemData.price * itemQuantity;

        await db.user.findByIdAndUpdate(interaction.user.id, {
            $inc: { coins: price }
        });

        userItem.quantity -= itemQuantity;
        await userItem.save();

        return interaction.reply(`> ${emojis.icons_correct} ${emojis.icons_text5} **Vendido!** ${interaction.user}, você **vendeu** com **sucesso** \`x${itemQuantity}\` ${itemDisplay} por \`${abbreviate(price)}\` ${emojis.icons_coin} **[ \`Moedas\` ]**!`);
    }
}
