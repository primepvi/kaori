"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terrainModel = void 0;
const mongoose_1 = require("mongoose");
const slotSchema = new mongoose_1.Schema({
    active: { type: Boolean, default: false },
    seed: { type: String, default: "" },
    startedAt: { type: Number, default: 0 },
    endsAt: { type: Number, default: 0 },
}, { _id: false });
const terrainSchema = new mongoose_1.Schema({
    owner: { type: String, required: true, ref: "users" },
    farm: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "farms" },
    width: { type: Number, default: 3 },
    height: { type: Number, default: 3 },
    createdAt: { type: Number, default: Date.now },
    slots: { type: [slotSchema], default: [] }
});
exports.terrainModel = (0, mongoose_1.model)("terrains", terrainSchema);
