"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../../types/command");
const seeds_json_1 = __importDefault(require("../../constants/seeds.json"));
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
const ms = require("ms");
const plantSeedChoices = Object.values(seeds_json_1.default)
    .map(item => ({ name: item.seed_display, value: item.seed_id }));
class TerrainPlantSubCommand extends command_1.SubSlashCommand {
    reference = "terrain";
    name = "plant";
    description = "Utilize esse comando para plantar uma semente.";
    options = [
        {
            name: "seed",
            description: "Insira aqui a semente que vai plantar.",
            type: discord_js_1.ApplicationCommandOptionType.String,
            choices: plantSeedChoices,
            required: true
        },
        {
            name: "quantity",
            description: "Insira aqui a quantidade de sementes que deseja plantar.",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            min_value: 1
        },
        {
            name: "terrain",
            description: "Insira aqui o id numérico do terreno que irá plantar a semente.",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            min_value: 1
        }
    ];
    async run(_, interaction) {
        await interaction.deferReply();
        const seedId = interaction.options.getString("seed", true);
        const seedQuantity = interaction.options.getInteger("quantity") ?? 1;
        const seed = seeds_json_1.default[seedId];
        const seedEmoji = _emojis_1.default[seed.seed_emoji];
        const terrainId = interaction.options.getInteger("terrain") ?? 1;
        const terrain = (await models_1.db.terrain.find({ owner: interaction.user.id }))
            .at(terrainId - 1);
        if (!terrain)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
            });
        const userItems = await models_1.db.item.find({ owner: interaction.user.id });
        const userSeedItem = userItems.find(item => item.id === seedId && item.quantity >= seedQuantity);
        if (!userSeedItem)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${seedQuantity}\` ${seedEmoji} **[ \`${seed.seed_display}\` ]** para **plantar**.`,
            });
        const avaiableSlots = terrain.slots.filter(s => !s.active);
        if (avaiableSlots.length < seedQuantity)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, seu **terreno não possui** \`${seedQuantity}\` **slots disponíveis** para **plantio**.`,
            });
        const currentTime = Date.now();
        const endTime = currentTime + ms(seed.cooldown);
        for (let i = 0; i < seedQuantity; i++) {
            const slot = avaiableSlots[i];
            slot.active = true;
            slot.seed = seedId;
            slot.startedAt = currentTime;
            slot.endsAt = endTime;
        }
        userSeedItem.quantity -= seedQuantity;
        await userSeedItem.save();
        await terrain.save();
        return interaction.editReply({
            content: `> ${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Sucesso!** ${interaction.user}, você **plantou** \`x${seedQuantity}\` ${seedEmoji} **[ \`${seed.seed_display}\` ]** no **terreno** \`${terrainId}\`.`
        });
    }
}
exports.default = TerrainPlantSubCommand;
