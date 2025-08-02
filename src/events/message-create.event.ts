import { OmitPartialGroupDMChannel, Message } from "discord.js";
import { Bot } from "../structs/bot";
import { BotEvent } from "../types/event";
import  emojis from "#emojis";

export default class extends BotEvent<"messageCreate"> {
    public name = "messageCreate" as const;
    public once = false;

    public runner(bot: Bot, message: OmitPartialGroupDMChannel<Message<boolean>>){
        const isValidMessageTrigger = message.inGuild() && !message.author.bot;
        if (!isValidMessageTrigger) return;

        if (message.content === bot.user.toString())
            return message.reply({
                content: `> ${emojis.icons_info} ${emojis.icons_text5} Olá ${message.author}, eu sou a **Kaori!** Todos os **meus comandos** estão em ${emojis.icons_supportscommandsbadge} **[ \`Slash Commands\` ]**.`
                + `\n-# ${emojis.icons_text1} Experimente digitar / para ver meus comandos.`
            });
    }
}
