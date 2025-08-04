"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const farm_1 = require("./farm");
const item_1 = require("./item");
const terrain_1 = require("./terrain");
const user_1 = require("./user");
exports.db = {
    user: user_1.userModel,
    item: item_1.itemModel,
    farm: farm_1.farmModel,
    terrain: terrain_1.terrainModel,
};
