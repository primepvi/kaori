import { GatewayIntentBits } from 'discord.js';
import { Bot } from './structs/bot';

const bot = new Bot({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.GuildIntegrations,
	],
	token: process.env.TOKEN as string,
});

bot.init();
