import { ApplicationCommandOptionData, ApplicationCommandOptionType, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../structs/bot";
import { logger } from "@kauzx/logger";

export abstract class SlashCommand implements ChatInputApplicationCommandData {
    abstract name: string;
    abstract description: string;
    abstract haveSubCommands: boolean;
    abstract options: ApplicationCommandOptionData[];
    abstract run(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">): unknown;

    public useDatabase = false;

    public register(bot: Bot) {
        bot.commands.set(this.name, this);
    }

    public async resolveSubCommand(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        if (!this.haveSubCommands)
            throw new Error("This command dont have sub commands.");

        const reference = interaction.options.getSubcommand(true);
        const subCommandName = `${this.name} ${reference}`;
        const subCommand = bot.subCommands.get(subCommandName);
        if (!subCommand)
            throw new Error("Invalid sub command.");

        await subCommand.run(bot, interaction);
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

export abstract class SubSlashCommand extends SlashCommand {
    abstract reference: string;
    abstract options: Exclude<ApplicationCommandOptionData, ApplicationCommandSubGroupData | ApplicationCommandSubCommandData>[];

    public haveSubCommands = false;

    public register(bot: Bot) {
        const referenceCommand = bot.commands.get(this.reference);
        if  (!referenceCommand?.haveSubCommands)
            return logger.error(`Erro ao registrar o subcommand ${this.name} no comando ${this.reference}:`,
                               `\n Esse comando não espera subcomandos ou não está registrado.`);


        referenceCommand.options.push(this.makeOption());

        const subCommandName = `${this.reference} ${this.name}`
        bot.subCommands.set(subCommandName, this);
    }

    public makeOption(): ApplicationCommandSubCommandData {
        return {
            name: this.name,
            description: this.description,
            type: ApplicationCommandOptionType.Subcommand,
            options: this.options as Exclude<ApplicationCommandOptionData,
                ApplicationCommandSubGroupData | ApplicationCommandSubCommandData
            >[],
        }
    }
}
