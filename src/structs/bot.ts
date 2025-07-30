import type { ClientEvents, GatewayIntentBits } from 'discord.js';
import { Client } from 'discord.js';
import type { BotEvent } from '../types/event';
import { BaseLoader } from './base-loader';

export interface BotOptions {
	token: string;
	intents: GatewayIntentBits[];
}

export type BotLoadableEvent = BotEvent<keyof ClientEvents>;

export class Bot extends Client<true> {
	public constructor(options: BotOptions) {
		super({
			...options,
		});

		this.token = options.token;
	}

	public async init() {
		await super.login(this.token);
		await this.loadEvents();
	}

	private async loadEvents() {
		const loader = new BaseLoader({
			allowDefaultImport: true,
			allowDeepLoad: true,
			allowInstances: true,
			basePath: 'src/events',
			extension: 'event.ts',
			resourceName: 'Evento',
		});

		await loader.load<BotLoadableEvent>(this);
	}
}
