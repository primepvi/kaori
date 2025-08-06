import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class TerrainCommand extends SlashCommand {
	public name = 'terrain';
	public description = 'Utilize esse comando para gerenciar seus terrenos.';
	public options = [];

	public override useDatabase = true;
	public haveSubCommands = true;

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		await super.resolveSubCommand(bot, interaction);
	}
}
