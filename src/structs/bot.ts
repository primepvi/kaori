import type { ClientEvents, GatewayIntentBits } from 'discord.js';
import { Client, Collection } from 'discord.js';
import type { BotEvent } from '../types/event';
import type { SlashCommand } from '../types/command.ts';
import { BaseLoader } from './base-loader';
import { logger } from '@kauzx/logger';

export interface BotOptions {
	token: string;
	intents: GatewayIntentBits[];
	slashCommandGuilds: string[];
}

export type BotLoadableEvent = BotEvent<keyof ClientEvents>;
export type BotLoadableCommand = SlashCommand;

export class Bot extends Client<true> {
	public commands = new Collection<string, SlashCommand>();
	public slashCommandGuilds: string[];

	public constructor(options: BotOptions) {
		super({
			...options,
		});

		this.token = options.token;
		this.slashCommandGuilds = options.slashCommandGuilds;
	}

	public async init() {
		await super.login(this.token);
		await this.loadEvents();
		await this.loadCommands();
	}

	private async loadEvents() {
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowInstances: true,
			basePath: 'src/events',
			extension: 'event.ts',
			resourceName: 'Evento',
		});

		await loader.load<BotLoadableEvent>(this);
	}

	private async loadCommands() {
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowDeepLoad: true,
			allowInstances: true,
			basePath: 'src/commands',
			extension: 'command.ts',
			resourceName: 'Slash Command'
		});

		await loader.load<BotLoadableCommand>(this);

		const commands = this.commands.map(c => c.toJSON());
		if (!commands) return;

		for (const guildId of this.slashCommandGuilds) {
			const guild = await this.guilds.fetch(guildId);
			await guild.commands.set(commands);

			logger.warn(`Slash Commands carregados na guild: ${guild.name} [${guildId}]`)
		}
	}
}
