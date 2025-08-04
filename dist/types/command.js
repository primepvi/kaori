"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubSlashCommand = exports.SlashCommand = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = require("@kauzx/logger");
class SlashCommand {
    useDatabase = false;
    register(bot) {
        bot.commands.set(this.name, this);
    }
    async resolveSubCommand(bot, interaction) {
        if (!this.haveSubCommands)
            throw new Error("This command dont have sub commands.");
        const reference = interaction.options.getSubcommand(true);
        const subCommandName = `${this.name} ${reference}`;
        const subCommand = bot.subCommands.get(subCommandName);
        if (!subCommand)
            throw new Error("Invalid sub command.");
        await subCommand.run(bot, interaction);
    }
    toJSON() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            type: discord_js_1.ApplicationCommandType.ChatInput
        };
    }
}
exports.SlashCommand = SlashCommand;
class SubSlashCommand extends SlashCommand {
    haveSubCommands = false;
    register(bot) {
        const referenceCommand = bot.commands.get(this.reference);
        if (!referenceCommand?.haveSubCommands)
            return logger_1.logger.error(`Erro ao registrar o subcommand ${this.name} no comando ${this.reference}:`, `\n Esse comando não espera subcomandos ou não está registrado.`);
        referenceCommand.options.push(this.makeOption());
        const subCommandName = `${this.reference} ${this.name}`;
        bot.subCommands.set(subCommandName, this);
    }
    makeOption() {
        return {
            name: this.name,
            description: this.description,
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            options: this.options,
        };
    }
}
exports.SubSlashCommand = SubSlashCommand;
