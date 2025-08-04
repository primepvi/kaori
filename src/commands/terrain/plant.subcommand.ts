import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand, SubSlashCommandOption } from "../../types/command";
import seeds from "../../constants/seeds.json";
import { db } from "../../models";
import emojis from "#emojis";
const ms = require("ms");

const plantSeedChoices = Object.values(seeds)
    .map(item => ({ name: item.seed_display, value: item.seed_id }));

export default class TerrainPlantSubCommand extends SubSlashCommand {
    public reference = "terrain";
    public name = "plant";
    public description = "Utilize esse comando para plantar uma semente.";
    public options: SubSlashCommandOption[] = [
        {
            name: "seed",
            description: "Insira aqui a semente que vai plantar.",
            type: ApplicationCommandOptionType.String,
            choices: plantSeedChoices,
            required: true
        },
        {
            name: "quantity",
            description: "Insira aqui a quantidade de sementes que deseja plantar.",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1
        },
        {
            name: "terrain",
            description: "Insira aqui o id numérico do terreno que irá plantar a semente.",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1
        }
    ];

    public async run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        await interaction.deferReply();

        const seedId = interaction.options.getString("seed", true);
        const seedQuantity = interaction.options.getInteger("quantity") ?? 1;
        const seed = seeds[seedId as keyof typeof seeds];
        const seedEmoji = emojis[seed.seed_emoji as keyof typeof emojis];

        const terrainId = interaction.options.getInteger("terrain") ?? 1;
        const terrain = (await db.terrain.find({ owner: interaction.user.id }))
          .at(terrainId - 1);

        if(!terrain) return interaction.editReply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
        });

        const userItems = await db.item.find({ owner: interaction.user.id });
        const userSeedItem = userItems.find(item => item.id === seedId && item.quantity >= seedQuantity);
        if (!userSeedItem) return interaction.editReply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${seedQuantity}\` ${seedEmoji} **[ \`${seed.seed_display}\` ]** para **plantar**.`,
        });

        const avaiableSlots = terrain.slots.filter(s => !s.active);
        if (avaiableSlots.length < seedQuantity) return interaction.editReply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, seu **terreno não possui** \`${seedQuantity}\` **slots disponíveis** para **plantio**.`,
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
            content: `> ${emojis.icons_correct} ${emojis.icons_text5} **Sucesso!** ${interaction.user}, você **plantou** \`x${seedQuantity}\` ${seedEmoji} **[ \`${seed.seed_display}\` ]** no **terreno** \`${terrainId}\`.`
        })
    }
}
