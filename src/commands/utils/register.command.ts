import { ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SlashCommand } from "../../types/command"
import { db } from "../../models";
import emojis from "#emojis";

export default class RegisterCommand extends SlashCommand {
    public name = "register";
    public description = "Utilize esse comando para se registrar no banco de dados.";
    public options = [];

    public async run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const userAlreadyRegistered = await db.user.exists({ _id: interaction.user.id });
        if (userAlreadyRegistered)
            return interaction.reply({
                content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro** ${interaction.user}, você **já está registrado** em meu ${emojis.icons_box} **[ \`Banco de Dados\` ]**!`,
                flags: ["Ephemeral"]
            })

        await db.user.create({
            _id: interaction.user.id
        })

        return interaction.reply({
            content: `> ${emojis.icons_correct} ${emojis.icons_text5} **Sucesso** ${interaction.user}, você foi **registrado** no meu ${emojis.icons_box} **[ \`Banco de Dados\` ]**!`
               + `\n-# ${emojis.icons_text1} Você já pode utilizar normalmente os meus comandos que utilizam banco de dados.`
        })
    }
}
