"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
class RegisterCommand extends command_1.SlashCommand {
    name = "register";
    description = "Utilize esse comando para se registrar no banco de dados.";
    options = [];
    haveSubCommands = false;
    async run(_, interaction) {
        await interaction.deferReply();
        const userAlreadyRegistered = await models_1.db.user.exists({ _id: interaction.user.id });
        if (userAlreadyRegistered)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro** ${interaction.user}, você **já está registrado** em meu ${_emojis_1.default.icons_box} **[ \`Banco de Dados\` ]**!`,
            });
        await models_1.db.user.create({
            _id: interaction.user.id
        });
        const farm = await models_1.db.farm.create({
            owner: interaction.user.id,
        });
        const slots = Array.from({ length: 9 }, () => {
            return {
                active: false,
                seed: "grass",
                startedAt: 0,
                endsAt: 0,
            };
        });
        const terrain = await models_1.db.terrain.create({
            owner: interaction.user.id,
            farm: farm._id,
            slots
        });
        farm.terrains = [terrain._id];
        await farm.save();
        return interaction.editReply({
            content: `> ${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Sucesso** ${interaction.user}, você foi **registrado** no meu ${_emojis_1.default.icons_box} **[ \`Banco de Dados\` ]**!`
                + `\n-# ${_emojis_1.default.icons_text1} Você já pode utilizar normalmente os meus comandos que utilizam banco de dados.`
        });
    }
}
exports.default = RegisterCommand;
