import type { Message, OmitPartialGroupDMChannel } from 'discord.js';
import emojis from '#emojis';
import type { Bot, BotEnviromentType } from '../structs/bot';
import { BotEvent } from '../types/event';

export default class extends BotEvent<'messageCreate'> {
	public name = 'messageCreate' as const;
	public once = false;

	public runner(
		bot: Bot,
		message: OmitPartialGroupDMChannel<Message<boolean>>
	) {
		const isValidMessageTrigger = message.inGuild() && !message.author.bot;
		if (!isValidMessageTrigger) return;

		const args = message.content.split(' ');
		const command = args.shift();

		if (command === 'kenv' && message.author.id === '1318285413957238819') {
			const enviroment = args[0];
			const validEnviroments = [
				'dev',
				'devprod',
				'prod',
			] satisfies BotEnviromentType[];

			if (!validEnviroments.includes(enviroment as BotEnviromentType))
				return message.react(emojis.icons_outage);

			bot.environment = enviroment as BotEnviromentType;
			return message.react(emojis.icons_correct);
		}

		if (message.content === bot.user.toString())
			return message.reply({
				content:
					`> ${emojis.icons_info} ${emojis.icons_text5} Olá ${message.author}, eu sou a **Kaori!** Todos os **meus comandos** estão em ${emojis.icons_supportscommandsbadge} **[ \`Slash Commands\` ]**.` +
					`\n-# ${emojis.icons_text1} Experimente digitar / para ver meus comandos.`,
			});
	}
}
