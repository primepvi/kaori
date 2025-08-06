import emojis from '#emojis';
import items from '../constants/items.json' with { type: 'json' };
import plants from '../constants/plants.json' with { type: 'json' };
import shopItems from '../constants/shop.json' with { type: 'json' };

export type BasePlant = typeof plants;
export type BasePlantKey = keyof BasePlant;

export type Items = typeof items;
export type ItemKey = keyof Items;

export type ShopItems = typeof shopItems;
export type ShopItemKey = keyof ShopItems;

export type Emojis = typeof emojis;
export type EmojiKey = keyof Emojis;

export interface Plant {
	emoji: EmojiKey;
	cooldown: string;
	product: PlantProduct;
	seed: PlantSeed;
}

export interface PlantProduct {
	id: ItemKey;
	item: ShopItemKey;
	price: number;
	operation: 'sell';
	display: string;
	emoji: EmojiKey;
	format(): string;
}

export interface PlantSeed {
	id: string;
	item: ShopItemKey;
	price: number;
	operation: 'buy';
	display: string;
	emoji: EmojiKey;
	format(): string;
}

export interface Item {
	id: ItemKey;
	item: ShopItemKey;
	display: string;
	emoji: EmojiKey;
	price: number;
	operation: 'buy' | 'sell';
	format(): string;
}

export class ItemManager {
	public static getPlant(plant: string) {
		const rawPlant = plants[plant as BasePlantKey];
		const rawProductItem = items[rawPlant.product as ItemKey];
		const rawSeed = items[rawPlant.seed as ItemKey];

		const shopProduct = shopItems[rawPlant.product as ShopItemKey];
		const shopSeed = shopItems[rawPlant.seed as ShopItemKey];

		const seed = {
			...shopSeed,
			...rawSeed,
			format() {
				return `${emojis[this.emoji]} **[ \`${this.display}\` ]**`;
			},
		} as PlantSeed;

		const product = {
			...shopProduct,
			...rawProductItem,
			format() {
				return `${emojis[this.emoji]} **[ \`${this.display}\` ]**`;
			},
		} as PlantProduct;

		return {
			emoji: rawPlant.emoji,
			cooldown: rawPlant.cooldown,
			product,
			seed,
		} as Plant;
	}

	public static isValidSeed(seed: string): boolean {
		return Object.values(plants).some((plant) => plant.seed === seed);
	}

	public static getPlantName(source: string) {
		return source.split('_')[0];
	}

	public static getItem(id: string) {
		const rawItem = items[id as ItemKey];
		const shopItem = shopItems[id as ShopItemKey];

		return {
			...rawItem,
			...shopItem,
			format() {
				return `${emojis[this.emoji]} **[ \`${this.display}\` ]**`;
			},
		} as Item;
	}
}
