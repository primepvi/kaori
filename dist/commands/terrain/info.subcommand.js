"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const command_1 = require("../../types/command");
const models_1 = require("../../models");
const _emojis_1 = __importDefault(require("#emojis"));
const seeds_json_1 = __importDefault(require("../../constants/seeds.json"));
const kompozr_1 = require("kompozr");
class TerrainInfoSubCommand extends command_1.SubSlashCommand {
    reference = "terrain";
    name = "info";
    description = "Utilize esse comando para ver informações de um terreno da sua fazenda.";
    options = [
        {
            name: "terrain",
            description: "Insira aqui o id numérico do terreno que deseja ver as informações.",
            type: discord_js_1.ApplicationCommandOptionType.Integer,
            min_value: 1,
        },
    ];
    async run(bot, interaction) {
        const terrainId = interaction.options.getInteger("terrain") ?? 1;
        const terrain = (await models_1.db.terrain.find({ owner: interaction.user.id }))
            .at(terrainId - 1);
        if (!terrain)
            return interaction.reply({
                content: `> ${_emojis_1.default.icons_outage} ${_emojis_1.default.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
                flags: ["Ephemeral"]
            });
        const currentTime = Date.now();
        const board = Array.from({ length: terrain.height }, (_, i) => {
            const slots = terrain.slots.slice(i * terrain.width, (i + 1) * terrain.width);
            const line = slots.map(slot => {
                const isValidSeed = Object.keys(seeds_json_1.default).includes(slot.seed);
                if (!isValidSeed)
                    return _emojis_1.default[slot.seed];
                const isReadyToCollect = currentTime >= slot.endsAt;
                const seed = seeds_json_1.default[slot.seed];
                const emojiName = isReadyToCollect ? seed.product_emoji : seed.emoji;
                return _emojis_1.default[emojiName];
            });
            return `> ${line.join(' ')}`;
        });
        const products = [];
        for (const slot of terrain.slots) {
            const isValidSeed = Object.keys(seeds_json_1.default).includes(slot.seed);
            if (!isValidSeed)
                continue;
            const seed = seeds_json_1.default[slot.seed];
            const isReadyToCollect = currentTime >= slot.endsAt;
            const productId = isReadyToCollect ? seed.product_id : seed.seed_id;
            const emojiName = isReadyToCollect ? seed.product_emoji : seed.emoji;
            const emoji = _emojis_1.default[emojiName];
            const product = products.find(p => p.id === productId) || {
                id: productId,
                display: `**${seed.product_display} [ \`${isReadyToCollect ? "Pronto!" : "Em Andamento"}\` ]**`,
                emoji,
                quantity: 0
            };
            product.quantity += 1;
            const index = products.findIndex(p => p.id === productId);
            if (index < 0)
                products.push(product);
            else
                products[index] = product;
        }
        const productsBoard = products.map(p => `> \`${p.quantity}x\` ${p.emoji} ${p.display}`).join("\n") || "\`...nenhum\`";
        const container = kompozr_1.k.container({
            color: "Aqua",
            components: [
                kompozr_1.k.text(`# ${_emojis_1.default.icons_farm} — Fazenda de ${interaction.user.displayName} | Terreno: ${terrainId}`, `-# ${_emojis_1.default.icons_text1} Aqui você pode ver o andamento da sua plantação.`, board.join('\n')),
                kompozr_1.k.separator.small,
                kompozr_1.k.text(`## ${_emojis_1.default.icons_todolist} — Produtos:`, productsBoard)
            ]
        });
        return interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"]
        });
    }
}
exports.default = TerrainInfoSubCommand;
