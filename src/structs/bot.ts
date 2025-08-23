import path from 'node:path';
import { logger } from '@kauzx/logger';
import type { ClientEvents, GatewayIntentBits } from 'discord.js';
import { Client, Collection } from 'discord.js';
import mongoose from 'mongoose';
import type { SlashCommand, SubSlashCommand } from '../types/command.ts';
import type { BotEvent } from '../types/event';
import { BaseLoader } from './base-loader';

export interface BotOptions {
	token: string;
	databaseUrl: string;
	intents: GatewayIntentBits[];
	slashCommandGuilds: string[];
}

export type BotLoadableEvent = BotEvent<keyof ClientEvents>;
export type BotLoadableCommand = SlashCommand;
export type BotLoadableSubCommand = SubSlashCommand;
export type BotEnviromentType = 'dev' | 'devprod' | 'prod';

export class Bot extends Client<true> {
	public commands = new Collection<string, SlashCommand>();
	public subCommands = new Collection<string, SubSlashCommand>();
	public environment: BotEnviromentType = 'dev';
	public version = 'alpha-v0.21';

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
		await this.connectDatabase();
		await super.login(this.token);

		await this.loadEvents();
		await this.loadCommands();
	}

	private async loadEvents() {
		const basePath = path.join(__dirname, '../events');
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowInstances: true,
			basePath,
			extension: 'event.@(ts|js)',
			resourceName: 'Evento',
		});

		await loader.load<BotLoadableEvent>(this);
	}

	private async loadCommands() {
		const basePath = path.join(__dirname, '../commands');
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowDeepLoad: true,
			allowInstances: true,
			basePath,
			extension: 'command.@(ts|js)',
			resourceName: 'Slash Command',
		});

		await loader.load<BotLoadableCommand>(this);
		await this.loadSubCommands();

		const commands = this.commands.map((c) => c.toJSON());
		if (!commands) return;

		for (const guildId of this.slashCommandGuilds) {
			const guild = await this.guilds.fetch(guildId);
			await guild.commands.set(commands);

			logger.warn(
				`Slash Commands carregados na guild: ${guild.name} [${guildId}]`
			);
		}
	}

	private async loadSubCommands() {
		const basePath = path.join(__dirname, '../commands');
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowDeepLoad: true,
			allowInstances: true,
			basePath,
			extension: 'subcommand.@(ts|js)',
			resourceName: 'Sub Slash Command',
		});

		await loader.load<BotLoadableSubCommand>(this);
	}

	private async connectDatabase() {
		try {
			await mongoose.connect(this.databaseUrl);
			logger.success('Database conectado com sucesso.');
		} catch (error) {
			logger.error(
				`Erro ao conectar-se ao banco de dados: ${(error as Error).message}`
			);
		}
	}
}
