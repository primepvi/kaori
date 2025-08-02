import { model, Schema, Types } from "mongoose";

export interface UserData {
    _id: string;
    farm: Types.ObjectId;
    coins: number;
    createdAt: number;
}

const userSchema = new Schema<UserData>({
    _id: { type: String, required: true },
    farm: { type: Schema.Types.ObjectId, ref: "Farm" },
    coins: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now }
})

export const userModel = model<UserData>("users", userSchema);
