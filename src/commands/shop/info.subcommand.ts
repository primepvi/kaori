import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand } from "../../types/command";
import { k } from "kompozr";
import emojis from "#emojis";
import shopItems from "../../constants/shop.json";

type Item = typeof shopItems[keyof typeof shopItems];

export default class ShopInfoCommand extends SubSlashCommand {
    public reference = "shop";
    public name = "info";
    public description = "Utilize esse comando para entrar na loja.";
    public options = [];

    public run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const ItemSection = k.fragment((item: Item) => {
            const emoji = emojis[item.emoji as keyof typeof emojis];
            const operationEmoji = item.operation === "buy" ? emojis.icons_djoin : emojis.icons_dleave;

            return [`> ${operationEmoji} ${emoji} ${emojis.icons_text5} **${item.display}**:`
                + `\n> -# ${emojis.icons_text1} ${emojis.icons_coin} **Preço: ${item.price}**`, k.separator.smallHidden]
        })

        const itemsDisplay = ItemSection(Object.values(shopItems)).flat(2);
        itemsDisplay.pop();

        const container = k.container({
            color: "Aqua",
            components: [
                k.section({
                    accessory: k.thumbnail({ url: "https://cdn.discordapp.com/emojis/1347627699773898888.png" }),
                    components: [k.text(
                        `# ${emojis.icons_marketcart} — Lojinha da Kaori`,
                        `-# ${emojis.icons_text1} Aqui você pode comprar e vender seus itens.`,
                        `> ${emojis.icons_djoin} **Comprar**: \`/shop buy <item> <quantidade?>\``,
                        `> ${emojis.icons_dleave} **Vender**: \`/shop sell <item> <quantidade?>\``,
                    )]
                }),
                k.separator.small,
                `## ${emojis.icons_todolist} — Catálogo`,
                ...itemsDisplay,
            ]
        });

        return interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"]
        });
    }
}
