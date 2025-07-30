import path from 'node:path';
import { logger } from '@kauzx/logger';
import { globSync } from 'fast-glob';
import type {
	BaseLoaderOptions,
	ConstructableLoadable,
	DefaultLoadable,
	Loadable,
} from '../types/loader';

export class BaseLoader {
	public pattern: string;
	public options: Required<BaseLoaderOptions>;

	public constructor(options: BaseLoaderOptions) {
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

	public async load<T extends Loadable>(...loadableItemsParams: unknown[]) {
		const files = globSync(this.pattern);
		for (const file of files) {
			const rawSource = await import(path.resolve(file));
			const source = this.options.allowDefaultImport
				? (rawSource as DefaultLoadable<T>).default
				: (rawSource as T);
			const resource = this.options.allowInstances
				? new (source as unknown as ConstructableLoadable<T>)()
				: source;

			if (typeof resource.register !== 'function') {
				logger.error(
					`Erro, houve uma tentativa de carregar um ${this.options.resourceName.toLowerCase()} sem função de registro: ${file}`
				);
				continue;
			}

			await resource.register.apply(resource, loadableItemsParams);

			logger.success(
				`O ${this.options.resourceName} ${resource.name} foi carregado com sucesso.`
			);
		}
	}
}
