import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import emojis from '../../constants/emojis.json';
import plants from '../../constants/plants.json';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import { type BasePlantKey, ItemManager } from '../../structs/item-manager';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

const ms = require('ms');

const plantSeedChoices = Object.keys(plants).map((plantName) => {
	const plant = ItemManager.getPlant(plantName);

	return {
		name: plant.seed.display,
		value: plantName,
	};
});

export default class TerrainPlantSubCommand extends SubSlashCommand {
	public reference = 'terrain';
	public name = 'plant';
	public description = 'Utilize esse comando para plantar uma semente.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'seed',
			description: 'Insira aqui a semente que vai plantar.',
			type: ApplicationCommandOptionType.String,
			choices: plantSeedChoices,
			required: true,
		},
		{
			name: 'quantity',
			description: 'Insira aqui a quantidade de sementes que deseja plantar.',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1,
		},
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

		const plantName = interaction.options.getString(
			'seed',
			true
		) as BasePlantKey;
		const plant = ItemManager.getPlant(plantName);

		const seedQuantity = interaction.options.getInteger('quantity') ?? 1;

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

		const userItems = await db.item.find({ owner: interaction.user.id });
		const userSeedItem = userItems.find(
			(item) => item.id === plant.seed.id && item.quantity >= seedQuantity
		);
		if (!userSeedItem)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${seedQuantity}\` ${plant.seed.format()} para **plantar**.`,
			});

		const avaiableSlots = terrain.slots.filter((s) => !s.active);
		if (avaiableSlots.length < seedQuantity)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, seu **terreno não possui** \`${seedQuantity}\` **slots disponíveis** para **plantio**.`,
			});

		const currentTime = Date.now();
		const endTime = currentTime + ms(plant.cooldown);

		for (let i = 0; i < seedQuantity; i++) {
			const slot = avaiableSlots[i];
			slot.active = true;
			slot.seed = plant.seed.id;
			slot.startedAt = currentTime;
			slot.endsAt = endTime;
		}

		const farmPlantData = farm.plants.get(plantName) || {
			name: plantName,
			harvested: 0,
			planted: 0,
		};

		farmPlantData.planted += seedQuantity;
		farm.plants.set(plantName, farmPlantData);

		userSeedItem.quantity -= seedQuantity;

		await userSeedItem.save();
		await farm.save();
		await terrain.save();

		return interaction.editReply({
			content: `> ${emojis.icons_correct} ${emojis.icons_text5} **Sucesso!** ${interaction.user}, você **plantou** \`x${seedQuantity}\` ${plant.seed.format()} no **terreno** \`${terrainId}\`.`,
		});
	}
}
