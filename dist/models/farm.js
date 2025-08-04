"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmModel = void 0;
const mongoose_1 = require("mongoose");
const farmSchema = new mongoose_1.Schema({
    owner: { type: String, required: true, ref: "users" },
    terrains: { type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "terrains" }], default: [] },
    createdAt: { type: Number, default: Date.now },
});
exports.farmModel = (0, mongoose_1.model)("farms", farmSchema);
