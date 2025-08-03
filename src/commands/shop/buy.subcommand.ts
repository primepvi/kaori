import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand, SubSlashCommandOption } from "../../types/command";
import shopItems from "../../constants/shop.json";
import { db } from "../../models";
import emojis from "#emojis";
import { abbreviate } from "util-stunks";

const buyItemChoices = Object.values(shopItems)
    .filter(item => item.operation === "buy")
    .map(item => ({ name: item.display, value: item.id }));

export default class ShopBuySubCommand extends SubSlashCommand {
    public reference = "shop";
    public name = "buy";
    public description = "Utilize esse comando para comprar um item da loja.";
    public options: SubSlashCommandOption[] = [
        {
            name: "item",
            description: "Insira aqui o nome do item que deseja comprar.",
            type: ApplicationCommandOptionType.String,
            choices: buyItemChoices,
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
        const userData = await db.user.findById(interaction.user.id);
        if (!userData) throw new Error("Unexpected error has ocurred.");

        const itemQuantity = interaction.options.getInteger("quantity") ?? 1;
        const itemId = interaction.options.getString("item", true);
        const item = shopItems[itemId as keyof typeof shopItems];
        const itemEmoji = emojis[item.emoji as keyof typeof emojis];


        const price = item.price * itemQuantity;
        if (price > userData.coins)
            return interaction.reply({
               content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não tem moedas suficiente** para **efetuar essa compra**.`,
               flags: ["Ephemeral"]
            });

        await db.item.findOneAndUpdate(
            { ownerId: interaction.user.id, id: itemId },
            {
                $setOnInsert: {
                    id: itemId,
                    ownerId: interaction.user.id,
                },
                $inc: { quantity: itemQuantity },
            },
            { upsert: true, new: true }
        );

        userData.coins -= price;
        await userData.save();

        return interaction.reply(`> ${emojis.icons_correct} ${emojis.icons_text5} **Comprado!** ${interaction.user}, você **comprou** com **sucesso** \`${abbreviate(itemQuantity)}x\` ${itemEmoji} **[ \`${item.display}\` ]** por \`${abbreviate(price)}\` ${emojis.icons_coin} **[ \`Moedas\` ]**!`);
    }
}
