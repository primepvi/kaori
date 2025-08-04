"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLoader = void 0;
const node_path_1 = __importDefault(require("node:path"));
const logger_1 = require("@kauzx/logger");
const fast_glob_1 = require("fast-glob");
class BaseLoader {
    pattern;
    options;
    constructor(options) {
        const pathAttachment = options.basePath.endsWith('/') ? '' : '/';
        const pathSufix = options.allowDeepLoad
            ? `${pathAttachment}**/*.${options.extension}`
            : `${pathAttachment}*.${options.extension}`;
        this.options = {
            allowDeepLoad: false,
            allowDefaultImport: false,
            allowInstances: false,
            resourceName: 'Recurso',
            ...options,
        };
        this.pattern = `${options.basePath}${pathSufix}`;
    }
    async load(...loadableItemsParams) {
        const files = (0, fast_glob_1.globSync)(this.pattern);
        for (const file of files) {
            const rawSource = await Promise.resolve(`${node_path_1.default.resolve(file)}`).then(s => __importStar(require(s)));
            const source = this.options.allowDefaultImport
                ? rawSource.default
                : rawSource;
            const resource = this.options.allowInstances
                ? new source()
                : source;
            if (typeof resource.register !== 'function') {
                logger_1.logger.error(`Erro, houve uma tentativa de carregar um ${this.options.resourceName.toLowerCase()} sem função de registro: ${file}`);
                continue;
            }
            await resource.register.apply(resource, loadableItemsParams);
            logger_1.logger.success(`O ${this.options.resourceName} ${resource.name} foi carregado com sucesso.`);
        }
    }
}
exports.BaseLoader = BaseLoader;
