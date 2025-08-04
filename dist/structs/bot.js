"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const base_loader_1 = require("./base-loader");
const logger_1 = require("@kauzx/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const node_path_1 = __importDefault(require("node:path"));
class Bot extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    subCommands = new discord_js_1.Collection();
    slashCommandGuilds;
    databaseUrl;
    constructor(options) {
        super({
            ...options,
        });
        this.token = options.token;
        this.slashCommandGuilds = options.slashCommandGuilds;
        this.databaseUrl = options.databaseUrl;
    }
    async init() {
        await this.connectDatabase();
        await super.login(this.token);
        await this.loadEvents();
        await this.loadCommands();
    }
    async loadEvents() {
        const basePath = node_path_1.default.join(__dirname, '../events');
        const loader = new base_loader_1.BaseLoader({
            allowDefaultImport: true,
            allowInstances: true,
            basePath,
            extension: 'event.@(ts|js)',
            resourceName: 'Evento',
        });
        await loader.load(this);
    }
    async loadCommands() {
        const basePath = node_path_1.default.join(__dirname, '../commands');
        const loader = new base_loader_1.BaseLoader({
            allowDefaultImport: true,
            allowDeepLoad: true,
            allowInstances: true,
            basePath,
            extension: 'command.@(ts|js)',
            resourceName: 'Slash Command'
        });
        await loader.load(this);
        await this.loadSubCommands();
        const commands = this.commands.map(c => c.toJSON());
        if (!commands)
            return;
        for (const guildId of this.slashCommandGuilds) {
            const guild = await this.guilds.fetch(guildId);
            await guild.commands.set(commands);
            logger_1.logger.warn(`Slash Commands carregados na guild: ${guild.name} [${guildId}]`);
        }
    }
    async loadSubCommands() {
        const basePath = node_path_1.default.join(__dirname, '../commands');
        const loader = new base_loader_1.BaseLoader({
            allowDefaultImport: true,
            allowDeepLoad: true,
            allowInstances: true,
            basePath,
            extension: 'subcommand.@(ts|js)',
            resourceName: 'Sub Slash Command'
        });
        await loader.load(this);
    }
    async connectDatabase() {
        try {
            await mongoose_1.default.connect(this.databaseUrl);
            logger_1.logger.success(`Database conectado com sucesso.`);
        }
        catch (error) {
            logger_1.logger.error(`Erro ao conectar-se ao banco de dados: ${error.message}`);
        }
    }
}
exports.Bot = Bot;
