"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const bot_1 = require("./structs/bot");
const bot = new bot_1.Bot({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildExpressions,
        discord_js_1.GatewayIntentBits.GuildIntegrations,
    ],
    token: process.env.TOKEN,
    databaseUrl: process.env.DATABASE_URL,
    slashCommandGuilds: [
        "1327425233388568576", // cdm
        "1251586916701311028" // union
    ],
});
bot.init();
