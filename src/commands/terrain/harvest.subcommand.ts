import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import emojis from '../../constants/emojis.json';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import { type BasePlantKey, ItemManager } from '../../structs/item-manager';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

interface HarvestData {
	id: string;
	name: BasePlantKey;
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

		const farm = await db.farm.findOne({ owner: interaction.user.id });
		if (!farm) throw new Error('Unexpected error has ocurred!');

		const currentTime = Date.now();
		const toHarvestSlots = terrain.slots.filter(
			(s) => currentTime >= s.endsAt && ItemManager.isValidSeed(s.seed)
		);

		if (toHarvestSlots.length <= 0)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, esse **terreno não está pronto** para a **colheita**.`,
			});

		const harvestProducts: HarvestData[] = [];
		for (const slot of toHarvestSlots) {
			const plantName = ItemManager.getPlantName(slot.seed) as BasePlantKey;
			const plant = ItemManager.getPlant(plantName);

			const emoji = emojis[plant.emoji];

			const harvestData: HarvestData = harvestProducts.find(
				(p) => p.id === plant.seed.id
			) || {
				id: plant.seed.id,
				name: plantName,
				product_id: plant.product.id,
				display: `${emoji} **[ \`${plant.product.display}\` ]**`,
				quantity: 0,
			};

			harvestData.quantity += 1;

			slot.active = false;
			slot.endsAt = 0;
			slot.startedAt = 0;
			slot.seed = 'grass';

			const index = harvestProducts.findIndex((p) => p.id === plant.seed.id);
			if (index < 0) harvestProducts.push(harvestData);
			else harvestProducts[index] = harvestData;
		}

		for (const product of harvestProducts) {
			const farmPlantData = farm.plants.get(product.name) || {
				name: product.name,
				harvested: 0,
				planted: 0,
			};

			farmPlantData.harvested += product.quantity;
			farm.plants.set(product.name, farmPlantData);

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

		await farm.save();
		await terrain.save();

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
