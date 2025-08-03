import type { ClientEvents, GatewayIntentBits } from 'discord.js';
import { Client, Collection } from 'discord.js';
import type { BotEvent } from '../types/event';
import type { SlashCommand, SubSlashCommand } from '../types/command.ts';
import { BaseLoader } from './base-loader';
import { logger } from '@kauzx/logger';
import mongoose from 'mongoose';

export interface BotOptions {
	token: string;
	databaseUrl: string;
	intents: GatewayIntentBits[];
	slashCommandGuilds: string[];
}

export type BotLoadableEvent = BotEvent<keyof ClientEvents>;
export type BotLoadableCommand = SlashCommand;
export type BotLoadableSubCommand = SubSlashCommand;

export class Bot extends Client<true> {
	public commands = new Collection<string, SlashCommand>();
	public subCommands = new Collection<string, SubSlashCommand>();

	public slashCommandGuilds: string[];
	public databaseUrl: string;

	public constructor(options: BotOptions) {
		super({
			...options,
		});

		this.token = options.token;
		this.slashCommandGuilds = options.slashCommandGuilds;
		this.databaseUrl = options.databaseUrl;
	}

	public async init() {
		await super.login(this.token);

		await this.loadEvents();
		await this.loadCommands();

		await this.connectDatabase();
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
		await this.loadSubCommands();

		const commands = this.commands.map(c => c.toJSON());
		if (!commands) return;

		for (const guildId of this.slashCommandGuilds) {
			const guild = await this.guilds.fetch(guildId);
			await guild.commands.set(commands);

			logger.warn(`Slash Commands carregados na guild: ${guild.name} [${guildId}]`)
		}
	}

	private async loadSubCommands() {
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowDeepLoad: true,
			allowInstances: true,
			basePath: 'src/commands',
			extension: 'subcommand.ts',
			resourceName: 'Sub Slash Command'
		});

		await loader.load<BotLoadableSubCommand>(this);
	}

	private async connectDatabase() {
		try {
			await mongoose.connect(this.databaseUrl);
			logger.success(`Database conectado com sucesso.`);
		} catch (error) {
			logger.error(`Erro ao conectar-se ao banco de dados: ${(error as Error).message}`)
		}
	}
}
