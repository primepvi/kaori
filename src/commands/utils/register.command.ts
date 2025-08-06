import type { ChatInputCommandInteraction } from 'discord.js';
import emojis from '../../constants/emojis.json';

import { db } from '../../models';
import type { TerrainSlotData } from '../../models/terrain';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class RegisterCommand extends SlashCommand {
	public name = 'register';
	public description =
		'Utilize esse comando para se registrar no banco de dados.';
	public options = [];
	public haveSubCommands = false;

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await interaction.deferReply();

		const userAlreadyRegistered = await db.user.exists({
			_id: interaction.user.id,
		});
		if (userAlreadyRegistered)
			return interaction.editReply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro** ${interaction.user}, você **já está registrado** em meu ${emojis.icons_box} **[ \`Banco de Dados\` ]**!`,
			});

		await db.user.create({
			_id: interaction.user.id,
		});

		const farm = await db.farm.create({
			owner: interaction.user.id,
		});

		const slots = Array.from({ length: 9 }, () => {
			return {
				active: false,
				seed: 'grass',
				startedAt: 0,
				endsAt: 0,
			} satisfies TerrainSlotData;
		});

		const terrain = await db.terrain.create({
			owner: interaction.user.id,
			farm: farm._id,
			slots,
		});

		farm.terrains = [terrain._id];
		await farm.save();

		return interaction.editReply({
			content:
				`> ${emojis.icons_correct} ${emojis.icons_text5} **Sucesso** ${interaction.user}, você foi **registrado** no meu ${emojis.icons_box} **[ \`Banco de Dados\` ]**!` +
				`\n-# ${emojis.icons_text1} Você já pode utilizar normalmente os meus comandos que utilizam banco de dados.`,
		});
	}
}
