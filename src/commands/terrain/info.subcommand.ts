import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { k } from 'kompozr';
import emojis from '#emojis';
import { ItemManager } from '@/structs/item-manager';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

interface SlotInfoData {
	id: string;
	emoji: string;
	display: string;
	quantity: number;
}

export default class TerrainInfoSubCommand extends SubSlashCommand {
	public reference = 'terrain';
	public name = 'info';
	public description =
		'Utilize esse comando para ver informações de um terreno da sua fazenda.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'terrain',
			description:
				'Insira aqui o id numérico do terreno que deseja ver as informações.',
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

		const currentTime = Date.now();

		const board = Array.from({ length: terrain.height }, (_, i) => {
			const slots = terrain.slots.slice(
				i * terrain.width,
				(i + 1) * terrain.width
			);
			const line = slots.map((slot) => {
				if (!ItemManager.isValidSeed(slot.seed))
					return emojis[slot.seed as keyof typeof emojis];

				const isReadyToCollect = currentTime >= slot.endsAt;

				const plantName = ItemManager.getPlantName(slot.seed);
				const plant = ItemManager.getPlant(plantName);

				const emojiName = isReadyToCollect ? plant.product.emoji : plant.emoji;
				return emojis[emojiName];
			});

			return `> ${line.join(' ')}`;
		});

		const slotsInfoData: SlotInfoData[] = [];
		for (const slot of terrain.slots) {
			if (!ItemManager.isValidSeed(slot.seed)) continue;

			const plantName = ItemManager.getPlantName(slot.seed);
			const plant = ItemManager.getPlant(plantName);

			const isReadyToCollect = currentTime >= slot.endsAt;
			const slotInfoId = isReadyToCollect ? plant.product.id : plant.seed.id;
			const emojiName = isReadyToCollect ? plant.product.emoji : plant.emoji;

			const emoji = emojis[emojiName as keyof typeof emojis];

			const slotInfo: SlotInfoData = slotsInfoData.find(
				(p) => p.id === slotInfoId
			) || {
				id: slotInfoId,
				display: `**${plant.product.display} [ \`${isReadyToCollect ? 'Pronto!' : 'Em Andamento'}\` ]**`,
				emoji,
				quantity: 0,
			};

			slotInfo.quantity += 1;

			const index = slotsInfoData.findIndex((p) => p.id === slotInfoId);
			if (index < 0) slotsInfoData.push(slotInfo);
			else slotsInfoData[index] = slotInfo;
		}

		const productsBoard =
			slotsInfoData
				.map((p) => `> \`x${p.quantity}\` ${p.emoji} ${p.display}`)
				.join('\n') || '`...nenhum`';

		const container = k.container({
			color: 'Aqua',
			components: [
				k.text(
					`# ${emojis.icons_farm} — Fazenda de ${interaction.user.displayName} | Terreno: ${terrainId}`,
					`-# ${emojis.icons_text1} Aqui você pode ver o andamento da sua plantação.`,
					board.join('\n')
				),
				k.separator.small,
				k.text(`## ${emojis.icons_todolist} — Produtos:`, productsBoard),
			],
		});

		return interaction.reply({
			components: [container],
			flags: ['IsComponentsV2'],
		});
	}
}
