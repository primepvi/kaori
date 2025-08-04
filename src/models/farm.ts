import { model, Schema, Types } from "mongoose";

export interface FarmData {
    owner: string;
    terrains: Types.ObjectId[];
    createdAt: number;
}

const farmSchema = new Schema<FarmData>({
    owner: { type: String, required: true, ref: "users" },
    terrains: { type: [{type: Schema.Types.ObjectId, ref: "terrains" }], default: [] },
    createdAt: { type: Number, default: Date.now },
})

export const farmModel = model<FarmData>("farms", farmSchema);
