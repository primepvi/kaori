"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const node_fs_1 = require("node:fs");
const baseURL = "https://discord.com/api";
const headers = {
    Authorization: `Bot ${process.env.TOKEN}`
};
async function fetchEmojis() {
    try {
        const response = await fetch(`${baseURL}/applications/${process.env.APPLICATION_ID}/emojis`, {
            headers
        });
        const data = (await response.json());
        const emojis = data.items.reduce((acc, curr) => ({ ...acc, [curr.name]: (0, discord_js_1.formatEmoji)(curr.id, curr.animated) }), {});
        (0, node_fs_1.writeFileSync)("src/constants/emojis.json", JSON.stringify(emojis, null, "\t"), "utf8");
    }
    catch (error) {
        console.error(error);
    }
}
fetchEmojis();
