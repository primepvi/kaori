import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abbreviate } from 'util-stunks';
import emojis from '../../constants/emojis.json';
import { db } from '../../models';
import type { TerrainSlotData } from '../../models/terrain';
import type { Bot } from '../../structs/bot';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

const TERRAIN_UPGRADES_PRICE = {
	4: 100_000,
	6: 500_000,
	7: 1_000_000,
	8: 5_000_000,
	9: 10_000_000,
};

const TERRAIN_MAX_WIDTH = Number(Object.keys(TERRAIN_UPGRADES_PRICE).at(-1));

export default class TerrainExpandSubCommand extends SubSlashCommand {
	public reference = 'terrain';
	public name = 'expand';
	public description =
		'Utilize esse comando para aumentar os slots de um terreno da sua fazenda.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'terrain',
			description: 'Insira aqui o id numérico do terreno que deseja expandir.',
			type: ApplicationCommandOptionType.Integer,
			min_value: 1,
		},
	];

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		const terrainId = interaction.options.getInteger('terrain') ?? 1;
		const terrain = (await db.terrain.find({ owner: interaction.user.id })).at(
			terrainId - 1
		);
		if (!terrain)
			return interaction.reply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
				flags: ['Ephemeral'],
			});

		if (terrain.width >= TERRAIN_MAX_WIDTH)
			return interaction.reply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, esse **terreno** atingiu a **capacidade máxima** de **slots**.`,
				flags: ['Ephemeral'],
			});

		const terrainSize = terrain.width + 1;

		const terrainOldTotalSize = terrain.width * terrain.width;
		const terrainTotalSize = terrainSize * terrainSize;

		const slotCount = terrainTotalSize - terrainOldTotalSize;
		const price =
			TERRAIN_UPGRADES_PRICE[
				terrainSize as keyof typeof TERRAIN_UPGRADES_PRICE
			];

		const userData = await db.user.findById(interaction.user.id);
		if (!userData) throw new Error('Unexpected error.');

		if (price > userData.coins)
			return interaction.reply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`${abbreviate(price)}\` ${emojis.icons_coin} **[ \`Moedas\` ]** para **expandir este terreno**.`,
				flags: ['Ephemeral'],
			});

		const newSlots: TerrainSlotData[] = Array.from(
			{ length: slotCount },
			() => {
				return {
					active: false,
					seed: 'grass',
					startedAt: 0,
					endsAt: 0,
				};
			}
		);

		userData.coins -= price;
		terrain.slots = [...terrain.slots, ...newSlots];
		terrain.width += 1;
		terrain.height += 1;

		await userData.save();
		await terrain.save();

		return interaction.reply(
			`> ${emojis.icons_correct} ${emojis.icons_text5} **Sucesso!** ${interaction.user}, você **expandiu com sucesso** o **terreno** \`${terrainId}\` por \`${abbreviate(price)}\` ${emojis.icons_coin} **[ \`Moedas\` ]**.`
		);
	}
}
