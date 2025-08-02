import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../types/command";
import { Bot } from "../../structs/bot";
import emojis from "#emojis";
import { db } from "../../models";

export default class PingCommand extends SlashCommand {
    public name = "ping";
    public description = "Utilize esse comando para ver minha latência.";
    public options = [];

    public async run(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        let startTimestamp = Date.now();
        await interaction.deferReply();

        const apiLatency = Date.now() - startTimestamp;
        const gatewayLatency = bot.ws.ping;

        startTimestamp = Date.now();
        await db.user.find({});

        const databaseLatency = Date.now() - startTimestamp;

        return interaction.editReply({
            content: `${emojis.icons_pong} ${emojis.icons_text5} **Pong!** ${interaction.user}, veja **logo abaixo** minha **latência**: ` +
                `\n> - ${emojis.icons_clock} ${emojis.icons_text6} **Gateway**: *\`${gatewayLatency}ms\`*` +
                `\n> - ${emojis.icons_spark} ${emojis.icons_text6} **Api**: *\`${apiLatency}ms\`*` +
                `\n> - ${emojis.icons_box} ${emojis.icons_text6} **Database**: *\`${databaseLatency}ms\`*`
        })

    }
}
