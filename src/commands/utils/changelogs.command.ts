import { readFileSync } from 'node:fs';
import type { ChatInputCommandInteraction } from 'discord.js';
import emojis from '../../constants/emojis.json';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class ChangelogsCommand extends SlashCommand {
	public name = 'changelogs';
	public description = 'Utilize esse comando para ver os changelogs.';
	public options = [];
	public haveSubCommands = false;

	public run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		let content = readFileSync(`docs/changelogs/${bot.version}.md`, 'utf-8');
		content = content.replace(/\[x\]/g, emojis.icons_correct);
		if (!content) throw new Error('Invalid version.');

		return interaction.reply(content);
	}
}
