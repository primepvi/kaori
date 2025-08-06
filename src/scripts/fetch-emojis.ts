import { writeFileSync } from 'node:fs';
import { formatEmoji } from 'discord.js';

const baseURL = 'https://discord.com/api';
const headers = {
	Authorization: `Bot ${process.env.TOKEN!}`,
};

async function fetchEmojis() {
	try {
		const response = await fetch(
			`${baseURL}/applications/${process.env.APPLICATION_ID}/emojis`,
			{
				headers,
			}
		);

		const data = (await response.json()) as any;
		const emojis = data.items.reduce(
			(acc: {}, curr: any) => ({
				...acc,
				[curr.name]: formatEmoji(curr.id, curr.animated),
			}),
			{}
		);

		writeFileSync(
			'src/constants/emojis.json',
			JSON.stringify(emojis, null, '\t'),
			'utf8'
		);
	} catch (error) {
		console.error(error);
	}
}

fetchEmojis();
