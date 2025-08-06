import type { ChatInputCommandInteraction } from 'discord.js';
import { abbreviate } from 'util-stunks';
import emojis from '#emojis';
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;
const MIN_REWARD = 250;
const MAX_REWARD = 1000;

export default class DailyCommand extends SlashCommand {
	public name = 'daily';
	public description =
		'Utilize esse comando para resgatar sua recompensa diária.';
	public options = [];
	public haveSubCommands = false;

	public override useDatabase = true;

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await interaction.deferReply();

		const userData = await db.user.findById(interaction.user.id);
		if (!userData) throw new Error('Daily: Unexpected error ocurred.');

		const userDailyCooldown = userData.cooldowns.get('daily') || 0;
		const userDailyIsReady = Date.now() >= userDailyCooldown;
		const parsedTimestamp = Math.floor(userDailyCooldown / 1000);

		if (!userDailyIsReady)
			return interaction.editReply({
				content: `> ${emojis.icons_clock} ${emojis.icons_text5} **Aguarde!** ${interaction.user}, sua ${emojis.icons_gift} **[ \`Recompensa Diária\` ]** estará **disponível** <t:${parsedTimestamp}:R>.`,
			});

		const newDailyCooldown = Date.now() + ONE_DAY_IN_MS;
		const newParsedTimestamp = Math.floor(newDailyCooldown / 1000);

		const reward =
			Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;
		const abbreviatedReward = abbreviate(reward);

		userData.coins += reward;
		userData.cooldowns.set('daily', newDailyCooldown);
		await userData.save();

		return interaction.editReply({
			content:
				`-# ${emojis.icons_text3} Sua recompensa diária estará disponível novamente <t:${newParsedTimestamp}:R>` +
				`\n${emojis.icons_correct} ${emojis.icons_text5} **Coletado!** ${interaction.user}, você **coletou** com **sucesso** sua ${emojis.icons_gift} **[ \`Recompensa Diária\` ]** e **recebeu**:` +
				`\n> - ${emojis.icons_coin} ${emojis.icons_text6} **Moedas**: \`${abbreviatedReward}\``,
		});
	}
}
