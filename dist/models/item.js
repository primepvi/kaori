"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemModel = void 0;
const mongoose_1 = require("mongoose");
const itemSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    owner: { type: String, required: true, ref: "users" },
    quantity: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
});
exports.itemModel = (0, mongoose_1.model)("items", itemSchema);
