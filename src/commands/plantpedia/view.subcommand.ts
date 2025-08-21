import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { k } from 'kompozr';
import { abbreviate, msToTime } from 'util-stunks';
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

const plantChoices = Object.keys(plants).map((plantName) => {
	const plant = ItemManager.getPlant(plantName);

	return {
		name: plant.product.display,
		value: plantName,
	};
});

const MINIMUM_PLANT_COUNT = 50;

export default class TerrainPlantSubCommand extends SubSlashCommand {
	public reference = 'plantpedia';
	public name = 'view';
	public description =
		'Utilize esse comando para ver informações de uma planta.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'plant',
			description: 'Insira aqui a planta que deseja ver informações.',
			type: ApplicationCommandOptionType.String,
			choices: plantChoices,
			required: true,
		},
	];

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await interaction.deferReply();

		const plantName = interaction.options.getString(
			'plant',
			true
		) as BasePlantKey;

		const plant = ItemManager.getPlant(plantName);

		const farm = await db.farm.findOne({ owner: interaction.user.id });
		if (!farm) throw new Error('Unexpected error has ocurred!');

		const farmPlantData = farm.plants.get(plantName) || {
			name: plantName,
			harvested: 0,
			planted: 0,
		};

		if (farmPlantData.planted < MINIMUM_PLANT_COUNT)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **precisa ter plantado** pelo menos \`x${MINIMUM_PLANT_COUNT}\` ${plant.seed.format()} para **desbloquear as informações** dessa **planta**.`,
			});

		const parsedHarvestTime = msToTime(ms(plant.cooldown));
		const emojiId = [...emojis[plant.emoji]]
			.filter((x) => !Number.isNaN(Number(x)))
			.join('');

		return interaction.editReply({
			components: [
				k.container({
					color: 'Aqua',
					components: [
						k.section({
							accessory: k.thumbnail({
								url: `https://cdn.discordapp.com/emojis/${emojiId}.png?size=2048&quality=lossless`,
							}),
							components: [
								k.text(
									`# ${emojis.icons_book} — Plantpedia: ${plant.product.display}`,
									`-# ${emojis.icons_text1} Logo abaixo você verá as informações dessa planta.`,
									`> ${emojis.icons_bookmark} ${emojis.icons_text5} **Nome:** \`${plant.product.display}\``,
									`> ${emojis.icons_uparrow} ${emojis.icons_text5} **Lucro:** \`${abbreviate(plant.product.price - plant.seed.price)} moedas\``,
									`> ${emojis.icons_clock} ${emojis.icons_text5} **Tempo de Crescimento:** \`${parsedHarvestTime}\``,
									`> ${emojis.icons_settings} ${emojis.icons_text5} **Emojis:** ${emojis[plant.seed.emoji]} ${emojis[plant.product.emoji]} ${emojis[plant.emoji]} ${emojis[plant.product_emoji]}`
								),
							],
						}),
						k.separator.small,
						k.text(
							`> ${emojis.icons_plant} ${emojis.icons_text5} **Plantou:** \`x${farmPlantData.planted}\``,
							`> ${emojis.icons_plant} ${emojis.icons_text5} **Colheu:** \`x${farmPlantData.harvested}\``
						),
					],
				}),
			],
			flags: ['IsComponentsV2'],
		});
	}
}
