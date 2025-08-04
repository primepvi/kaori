import { Interaction, CacheType } from "discord.js";
import { Bot } from "../structs/bot";
import { BotEvent } from "../types/event";
import emojis from "#emojis";
import { db } from "../models";

export default class extends BotEvent<"interactionCreate"> {
    public name = "interactionCreate" as const;
    public once = false;

    public async runner(bot: Bot, interaction: Interaction<CacheType>) {
        if (!interaction.inGuild()) return;
        if (interaction.isChatInputCommand()) {
            const command = bot.commands.get(interaction.commandName);
            const userIsRegistered = await db.user.exists({ _id: interaction.user.id });

            if (!command)
                return interaction.reply({
                    content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro** ${interaction.user}, esse **comando não foi encontrado**, tente novamente mais tarde!`,
                    flags: ["Ephemeral"]
                });

            try {
                if (command.useDatabase && !userIsRegistered)
                    return interaction.reply({
                        content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro** ${interaction.user}, para **utilizar este comando** você **precisa** se **registrar** no meu ${emojis.icons_box} **[ \`Banco de Dados\` ]**!`
                            + `\n-# ${emojis.icons_text1} Utilize o comando /register para efetuar o seu registro no meu banco de dados.`,
                        flags: ["Ephemeral"]
                    });

                await command.run(bot, interaction);
            } catch (error) {
                const method = interaction.deferred ? "editReply" : "reply";

                interaction[method]({
                    content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro** ${interaction.user}, **ocorreu um erro** ao **executar** esse **comando**, tente novamente mais tarde!`,
                });

                console.error(error);
            }
        }
    }
}
