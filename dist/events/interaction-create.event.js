"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../types/event");
const _emojis_1 = __importDefault(require("#emojis"));
const models_1 = require("../models");
class default_1 extends event_1.BotEvent {
    name = "interactionCreate";
    once = false;
    async runner(bot, interaction) {
        if (!interaction.inGuild())
            return;
        if (interaction.isChatInputCommand()) {
            const command = bot.commands.get(interaction.commandName);
            const userIsRegistered = await models_1.db.user.exists({ _id: interaction.user.id });
            if (!command)
                return interaction.reply({
                    content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro** ${interaction.user}, esse **comando não foi encontrado**, tente novamente mais tarde!`,
                    flags: ["Ephemeral"]
                });
            try {
                if (command.useDatabase && !userIsRegistered)
                    return interaction.reply({
                        content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro** ${interaction.user}, para **utilizar este comando** você **precisa** se **registrar** no meu ${_emojis_1.default.icons_box} **[ \`Banco de Dados\` ]**!`
                            + `\n-# ${_emojis_1.default.icons_text1} Utilize o comando /register para efetuar o seu registro no meu banco de dados.`,
                        flags: ["Ephemeral"]
                    });
                await command.run(bot, interaction);
            }
            catch (error) {
                const method = interaction.deferred ? "editReply" : "reply";
                interaction[method]({
                    content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro** ${interaction.user}, **ocorreu um erro** ao **executar** esse **comando**, tente novamente mais tarde!`,
                });
                console.error(error);
            }
        }
    }
}
exports.default = default_1;
