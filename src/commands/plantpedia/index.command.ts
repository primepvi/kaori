import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class PlantPediaCommand extends SlashCommand {
	public name = 'plantpedia';
	public description =
		'Utilize esse comando para ver a enciclopédia de plantas.';
	public options = [];

	public haveSubCommands = true;
	public useDatabase = true;

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await super.resolveSubCommand(bot, interaction);
	}
}
