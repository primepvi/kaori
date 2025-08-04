import { model, Schema, Types } from "mongoose";

export type UserCooldownKey = "daily";

export interface UserData {
    _id: string;
    farm: Types.ObjectId;
    coins: number;
    createdAt: number;
    cooldowns: Map<UserCooldownKey, number>;
}

const userSchema = new Schema<UserData>({
    _id: { type: String, required: true },
    farm: { type: Schema.Types.ObjectId, ref: "farms" },
    coins: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
    cooldowns: { type: Map, of: Number, default: new Map() }
})

export const userModel = model<UserData>("users", userSchema);
