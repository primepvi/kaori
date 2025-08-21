import { model, Schema, type Types } from 'mongoose';
import type { BasePlantKey } from '../structs/item-manager';

export interface FarmData {
	owner: string;
	terrains: Types.ObjectId[];
	createdAt: number;
	plants: Map<BasePlantKey, FarmPlantData>;
}

export interface FarmPlantData {
	name: BasePlantKey;
	planted: number;
	harvested: number;
}

const farmPlantSchema = new Schema<FarmPlantData>(
	{
		name: { type: String, required: true },
		planted: { type: Number, default: 0 },
		harvested: { type: Number, default: 0 },
	},
	{ _id: false }
);

const farmSchema = new Schema<FarmData>({
	owner: { type: String, required: true, ref: 'users' },
	terrains: {
		type: [{ type: Schema.Types.ObjectId, ref: 'terrains' }],
		default: [],
	},
	plants: { type: Map, of: farmPlantSchema, default: new Map() },
	createdAt: { type: Number, default: Date.now },
});

export const farmModel = model<FarmData>('farms', farmSchema);
