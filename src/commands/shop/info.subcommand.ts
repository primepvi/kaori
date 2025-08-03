import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand } from "../../types/command";

export default class ShopInfoSubCommand extends SubSlashCommand {
    public reference = "shop";
    public name = "info";
    public description = "Utilize esse comando para entrar na loja.";
    public options = [];

    public run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        return interaction.reply("Loja mutcho foda.");
    }
}
