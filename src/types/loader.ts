export interface BaseLoaderOptions {
	extension: string;
	basePath: string;
	resourceName?: string;
	allowDeepLoad?: boolean;
	allowDefaultImport?: boolean;
	allowInstances?: boolean;
}

export interface Loadable {
	name: string;
	register(...params: unknown[]): unknown | Promise<unknown>;
}

export interface DefaultLoadable<T extends Loadable> {
	default: T;
}

export interface ConstructableLoadable<T extends Loadable> {
	new (): T;
}
