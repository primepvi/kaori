import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import emojis from '#emojis';
import seeds from '../../constants/seeds.json' with { type: 'json' };
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

interface HarvestData {
	id: string;
	product_id: string;
	display: string;
	quantity: number;
}

export default class TerrainHarvestSubCommand extends SubSlashCommand {
	public reference = 'terrain';
	public name = 'harvest';
	public description =
		'Utilize esse comando para fazer a colheita em um terreno.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'terrain',
			description:
				'Insira aqui o id numérico do terreno que irá plantar a semente.',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1,
		},
	];

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await interaction.deferReply();

		const terrainId = interaction.options.getInteger('terrain') ?? 1;
		const terrain = (await db.terrain.find({ owner: interaction.user.id })).at(
			terrainId - 1
		);

		if (!terrain)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
			});

		const validSeeds = Object.keys(seeds);
		const currentTime = Date.now();
		const toHarvestSlots = terrain.slots.filter(
			(s) => currentTime >= s.endsAt && validSeeds.includes(s.seed)
		);

		if (toHarvestSlots.length <= 0)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, esse **terreno não está pronto** para a **colheita**.`,
			});

		const harvestProducts: HarvestData[] = [];
		for (const slot of toHarvestSlots) {
			const seed = seeds[slot.seed as keyof typeof seeds];
			const emoji = emojis[seed.emoji as keyof typeof emojis];

			const harvestData: HarvestData = harvestProducts.find(
				(p) => p.id === seed.seed_id
			) || {
				id: seed.seed_id,
				product_id: seed.product_id,
				display: `${emoji} **[ \`${seed.product_display}\` ]**`,
				quantity: 0,
			};

			harvestData.quantity += 1;

			slot.active = false;
			slot.endsAt = 0;
			slot.startedAt = 0;
			slot.seed = 'grass';

			const index = harvestProducts.findIndex((p) => p.id === seed.seed_id);
			if (index < 0) harvestProducts.push(harvestData);
			else harvestProducts[index] = harvestData;
		}

		await terrain.save();

		for (const product of harvestProducts) {
			await db.item.findOneAndUpdate(
				{ id: product.product_id, owner: interaction.user.id },
				{
					$setOnInsert: {
						id: product.product_id,
						owner: interaction.user.id,
					},
					$inc: { quantity: product.quantity },
				},
				{ upsert: true, new: true }
			);
		}

		const harvestBoard = harvestProducts
			.map((p) => `> - \`x${p.quantity}\` ${p.display}`)
			.join('\n');
		return interaction.editReply({
			content:
				`${emojis.icons_correct} ${emojis.icons_text5} **Colheita!** ${interaction.user}, você fez a **colheita** no **terreno** \`${terrainId}\` e obteve:\n` +
				harvestBoard,
		});
	}
}
