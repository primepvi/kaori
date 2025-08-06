import type { ChatInputCommandInteraction } from 'discord.js';
import type { Bot } from '../../structs/bot';
import { SlashCommand } from '../../types/command';

export default class ShopCommand extends SlashCommand {
	public name = 'shop';
	public description = 'Utilize esse comando para utilizar a loja.';
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
