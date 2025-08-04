"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    farm: { type: mongoose_1.Schema.Types.ObjectId, ref: "farms" },
    coins: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
    cooldowns: { type: Map, of: Number, default: new Map() }
});
exports.userModel = (0, mongoose_1.model)("users", userSchema);
