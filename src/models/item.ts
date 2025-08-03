import { model, Schema } from "mongoose";

export interface ItemData {
    id: string;
    ownerId: string;
    quantity: number;
    createdAt: number;
}

const itemSchema = new Schema<ItemData>({
    id: { type: String, required: true },
    ownerId: { type: String, required: true, ref: "users" },
    quantity: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
})

export const itemModel = model<ItemData>("items", itemSchema);
