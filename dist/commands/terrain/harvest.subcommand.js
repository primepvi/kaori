"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../../types/command");
const _emojis_1 = __importDefault(require("#emojis"));
const seeds_json_1 = __importDefault(require("../../constants/seeds.json"));
const models_1 = require("../../models");
class TerrainHarvestSubCommand extends command_1.SubSlashCommand {
    reference = "terrain";
    name = "harvest";
    description = "Utilize esse comando para fazer a colheita em um terreno.";
    options = [
        {
            name: "terrain",
            description: "Insira aqui o id numérico do terreno que irá plantar a semente.",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            min_value: 1
        }
    ];
    async run(_, interaction) {
        await interaction.deferReply();
        const terrainId = interaction.options.getInteger("terrain") ?? 1;
        const terrain = (await models_1.db.terrain.find({ owner: interaction.user.id }))
            .at(terrainId - 1);
        if (!terrain)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
            });
        const validSeeds = Object.keys(seeds_json_1.default);
        const currentTime = Date.now();
        const toHarvestSlots = terrain.slots.filter(s => currentTime >= s.endsAt && validSeeds.includes(s.seed));
        if (toHarvestSlots.length <= 0)
            return interaction.editReply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, esse **terreno não está pronto** para a **colheita**.`,
            });
        const harvestProducts = [];
        for (const slot of toHarvestSlots) {
            const seed = seeds_json_1.default[slot.seed];
            const emoji = _emojis_1.default[seed.emoji];
            const harvestData = harvestProducts.find(p => p.id === seed.seed_id) || {
                id: seed.seed_id,
                product_id: seed.product_id,
                display: `${emoji} **[ \`${seed.product_display}\` ]**`,
                quantity: 0,
            };
            harvestData.quantity += 1;
            slot.active = false;
            slot.endsAt = 0;
            slot.startedAt = 0;
            slot.seed = "grass";
            const index = harvestProducts.findIndex(p => p.id === seed.seed_id);
            if (index < 0)
                harvestProducts.push(harvestData);
            else
                harvestProducts[index] = harvestData;
        }
        await terrain.save();
        for (const product of harvestProducts) {
            await models_1.db.item.findOneAndUpdate({ id: product.product_id, owner: interaction.user.id }, {
                $setOnInsert: {
                    id: product.product_id,
                    owner: interaction.user.id,
                },
                $inc: { quantity: product.quantity }
            }, { upsert: true, new: true });
        }
        const harvestBoard = harvestProducts.map(p => `> - \`x${p.quantity}\` ${p.display}`).join("\n");
        return interaction.editReply({
            content: `${_emojis_1.default.icons_correct} ${_emojis_1.default.icons_text5} **Colheita!** ${interaction.user}, você fez a **colheita** no **terreno** \`${terrainId}\` e obteve:\n` +
                harvestBoard
        });
    }
}
exports.default = TerrainHarvestSubCommand;
