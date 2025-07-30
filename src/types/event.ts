import type { ClientEvents } from 'discord.js';
import type { Bot } from '../structs/bot';

export abstract class BotEvent<T extends keyof ClientEvents> {
	abstract name: T;
	abstract once: boolean;
	abstract runner(bot: Bot, ...args: ClientEvents[T]): unknown;

	public register(bot: Bot) {
		const operation = this.once ? 'once' : 'on';
		bot[operation](this.name, (...args) => this.runner(bot, ...args));
	}
}
