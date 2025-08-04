import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SlashCommand } from "../../types/command";
import { db } from "../../models";
import { abbreviate } from "util-stunks";
import emojis from "#emojis";

export default class BalanceCommand extends SlashCommand {
    public name = "balance";
    public description = "Utilize esse comando para ver quantas moedas você possui na carteira.";
    public options = [];

    public useDatabase = true;
    public haveSubCommands = false;

    public async run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const userData = await db.user.findById(interaction.user.id);
        if (!userData) throw new Error("Unexpected error has ocurred.");

        const balance = abbreviate(userData.coins);
        return interaction.reply(`> ${emojis.icons_coin} ${emojis.icons_text5} ${interaction.user}, você **possui** \`${balance}\` **moedas** em sua **carteira**.`);
    }
}
