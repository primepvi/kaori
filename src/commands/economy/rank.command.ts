import type { ChatInputCommandInteraction } from 'discord.js';
import { k } from 'kompozr';
import { abbreviate } from 'util-stunks';
import emojis from '../../constants/emojis.json';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class RankCommand extends SlashCommand {
	public name = 'rank';
	public description = 'Utilize esse comando para ver o ranking de moedas.';
	public options = [];

	public override useDatabase = true;
	public haveSubCommands = false;

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		const topUsers = await db.user
			.find({ coins: { $gt: 0 } })
			.sort({ coins: -1 })
			.limit(9);

		const board = topUsers
			.map((user, i) => {
				const username =
					bot.users.cache.get(user._id)?.username || 'Desconhecido...';

				return `> **[ \`#${i + 1}\` ]**  [**${username}**](https://discord.com/users/${user._id}): \`${abbreviate(user.coins)} moedas\``;
			})
			.join('\n');

		return interaction.reply({
			components: [
				k.container({
					color: 'Gold',
					components: [`# ${emojis.icons_coin} | Ranking de Moedas`, board],
				}),
			],
			flags: ['IsComponentsV2'],
		});
	}
}
