import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SlashCommand } from "../../types/command";

export default class ShopCommand extends SlashCommand {
    public name = "shop";
    public description = "Utilize esse comando para entrar na loja.";
    public haveSubCommands = true;
    public options = [];

    public async run(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        await super.resolveSubCommand(bot, interaction);
    }
}
