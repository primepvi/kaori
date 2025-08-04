"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
const util_stunks_1 = require("util-stunks");
const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const MIN_REWARD = 250;
const MAX_REWARD = 1000;
class DailyCommand extends command_1.SlashCommand {
    name = "daily";
    description = "Utilize esse comando para resgatar sua recompensa diária.";
    options = [];
    haveSubCommands = false;
    useDatabase = true;
    async run(_, interaction) {
        await interaction.deferReply();
        const userData = await models_1.db.user.findById(interaction.user.id);
        if (!userData)
            throw new Error("Daily: Unexpected error ocurred.");
        const userDailyCooldown = userData.cooldowns.get("daily") || 0;
        const userDailyIsReady = Date.now() >= userDailyCooldown;
        const parsedTimestamp = Math.floor(userDailyCooldown / 1000);
        if (!userDailyIsReady)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_clock} ${_emojis_1.default.icons_text5} **Aguarde!** ${interaction.user}, sua ${_emojis_1.default.icons_gift} **[ \`Recompensa Diária\` ]** estará **disponível** <t:${parsedTimestamp}:R>.`,
            });
        const newDailyCooldown = Date.now() + ONE_DAY_IN_MS;
        const newParsedTimestamp = Math.floor(newDailyCooldown / 1000);
        const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
        const abbreviatedReward = (0, util_stunks_1.abbreviate)(reward);
        userData.coins += reward;
        userData.cooldowns.set("daily", newDailyCooldown);
        await userData.save();
        return interaction.editReply({
            content: `-# ${_emojis_1.default.icons_text3} Sua recompensa diária estará disponível novamente <t:${newParsedTimestamp}:R>`
                + `\n${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Coletado!** ${interaction.user}, você **coletou** com **sucesso** sua ${_emojis_1.default.icons_gift} **[ \`Recompensa Diária\` ]** e **recebeu**:`
                + `\n> - ${_emojis_1.default.icons_coin} ${_emojis_1.default.icons_text6} **Moedas**: \`${abbreviatedReward}\``
        });
    }
}
exports.default = DailyCommand;
