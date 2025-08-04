import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SlashCommand } from "../../types/command";
import { db } from "../../models";
import emojis from "#emojis";
import items from "../../constants/items.json";
import { k } from "kompozr";
import { abbreviate } from "util-stunks";

export default class InventoryCommand extends SlashCommand {
    public name = "inventory";
    public description = "Utilize esse comando para ver seu inventário.";
    public options = [];

    public override useDatabase = true;
    public haveSubCommands = false;

    public async run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const userItems = await db.item.find({ owner: interaction.user.id })
        if (!userItems) return interaction.reply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui nenhum item** em seu **inventário**.`,
            flags: ["Ephemeral"]
        })

        const ItemSection = k.fragment((rawItem: typeof userItems[number]) => {
           const item = items[rawItem.id as keyof typeof items];
           if (!item) return "";

           const emoji = emojis[item.emoji as keyof typeof emojis];

           return `> - \`${abbreviate(rawItem.quantity)}x\` ${emoji} **[ \`${item.display}\` ]**`
        });

        return interaction.reply({
            content: `${emojis.icons_backpack} ${emojis.icons_text5} ${interaction.user}, **veja** logo **abaixo** seu **inventário**:\n` +
                ItemSection(userItems).join('\n')
        })
    }
}
