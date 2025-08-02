import { ApplicationCommandOptionData, ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../structs/bot";
import { logger } from "@kauzx/logger";

export abstract class SlashCommand implements ChatInputApplicationCommandData {
    abstract name: string;
    abstract description: string;
    abstract options?: readonly ApplicationCommandOptionData[];
    abstract run(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">): unknown;

    public register(bot: Bot) {
        bot.commands.set(this.name, this);
        logger.success(`O slash command ${this.name} foi carregado com sucesso.`)
    }

    public toJSON(): ChatInputApplicationCommandData {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            type: ApplicationCommandType.ChatInput
        }
    }
}
