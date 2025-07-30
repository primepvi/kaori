import { logger } from '@kauzx/logger';
import type { Client } from 'discord.js';
import type { Bot } from '../structs/bot';
import { BotEvent } from '../types/event';

export default class extends BotEvent<'ready'> {
	public name = 'ready' as const;
	public once = true;

	public runner(_: Bot, client: Client<true>) {
		logger.success(`Bot online com sucesso: ${client.user.username}.`);
	}
}
