import type { ChatInputCommandInteraction } from 'discord.js';
import { abbreviate } from 'util-stunks';
import emojis from '#emojis';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class BalanceCommand extends SlashCommand {
	public name = 'balance';
	public description =
		'Utilize esse comando para ver quantas moedas você possui na carteira.';
	public options = [];

	public override useDatabase = true;
	public haveSubCommands = false;

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		const userData = await db.user.findById(interaction.user.id);
		if (!userData) throw new Error('Unexpected error has ocurred.');

		const balance = abbreviate(userData.coins);
		return interaction.reply(
			`> ${emojis.icons_coin} ${emojis.icons_text5} ${interaction.user}, você **possui** \`${balance}\` **moedas** em sua **carteira**.`
		);
	}
}
