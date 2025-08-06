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
	token: process.env.TOKEN!,
	databaseUrl: process.env.DATABASE_URL!,
	slashCommandGuilds: [
		'1327425233388568576', // cdm
		'1251586916701311028', // union
	],
});

bot.init();
