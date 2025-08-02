import { Interaction, CacheType } from "discord.js";
import { Bot } from "../structs/bot";
import { BotEvent } from "../types/event";
import emojis from "#emojis";

export default class extends BotEvent<"interactionCreate"> {
    public name = "interactionCreate" as const;
    public once = false;

    public async runner(bot: Bot, interaction: Interaction<CacheType>) {
        if (!interaction.inGuild()) return;
        if (interaction.isChatInputCommand()) {
            const command = bot.commands.get(interaction.commandName);
            if (!command)
                return interaction.reply({
                    content: `> ${emojis.icons_busy} ${emojis.icons_text5} Erro ${interaction.user}, esse comando não foi encontrado, tente novamente mais tarde!`,
                    flags: ["Ephemeral"]
                });

            try {
                await command.run(bot, interaction);
            } catch (error) {
                interaction.reply({
                    content: `> ${emojis.icons_busy} ${emojis.icons_text5} Erro ${interaction.user}, ocorreu um erro ao executar esse comando, tente novamente mais tarde!`,
                    flags: ["Ephemeral"]
                });

                console.error(error);
            }
        }
    }
}
