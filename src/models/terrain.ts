import { model, Schema, type Types } from 'mongoose';

export interface TerrainData {
	owner: string;
	farm: Types.ObjectId;
	width: number;
	height: number;
	createdAt: number;
	slots: TerrainSlotData[];
}

export interface TerrainSlotData {
	active: boolean;
	seed: string;
	startedAt: number;
	endsAt: number;
}

const slotSchema = new Schema<TerrainSlotData>(
	{
		active: { type: Boolean, default: false },
		seed: { type: String, default: '' },
		startedAt: { type: Number, default: 0 },
		endsAt: { type: Number, default: 0 },
	},
	{ _id: false }
);

const terrainSchema = new Schema<TerrainData>({
	owner: { type: String, required: true, ref: 'users' },
	farm: { type: Schema.Types.ObjectId, required: true, ref: 'farms' },
	width: { type: Number, default: 3 },
	height: { type: Number, default: 3 },
	createdAt: { type: Number, default: Date.now },
	slots: { type: [slotSchema], default: [] },
});

export const terrainModel = model<TerrainData>('terrains', terrainSchema);
