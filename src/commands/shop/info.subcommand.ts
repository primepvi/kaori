import type { ChatInputCommandInteraction } from 'discord.js';
import { k } from 'kompozr';
import emojis from '../../constants/emojis.json';
import shopItems from '../../constants/shop.json';
import type { Bot } from '../../structs/bot';
import {
	ItemManager,
	type ShopItemKey,
	type ShopItems,
} from '../../structs/item-manager';
import { SubSlashCommand } from '../../types/command';

export default class ShopInfoCommand extends SubSlashCommand {
	public reference = 'shop';
	public name = 'info';
	public description = 'Utilize esse comando para entrar na loja.';
	public options = [];

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		const guild = await bot.guilds.fetch(interaction.guildId);
		const command = guild.commands.cache.find((c) => c.name === 'shop');
		if (!command) throw new Error('Unexpected error has ocurred..');

		const ItemSection = k.fragment((rawItem: ShopItems[ShopItemKey]) => {
			const item = ItemManager.getItem(rawItem.item);

			const operationEmoji =
				item.operation === 'buy' ? emojis.icons_dleave : emojis.icons_djoin;

			return [
				`> ${operationEmoji} ${emojis[item.emoji]} ${emojis.icons_text5} **${item.display}**:` +
					`\n> -# ${emojis.icons_text1} ${emojis.icons_coin} **Preço: ${item.price}**`,
				k.separator.smallHidden,
			];
		});

		const itemsDisplay = ItemSection(Object.values(shopItems)).flat(2);
		itemsDisplay.pop();

		const container = k.container({
			color: 'Aqua',
			components: [
				k.section({
					accessory: k.thumbnail({
						url: 'https://cdn.discordapp.com/emojis/1347627699773898888.png',
					}),
					components: [
						k.text(
							`# ${emojis.icons_marketcart} — Lojinha da Kaori`,
							`-# ${emojis.icons_text1} Aqui você pode comprar e vender seus itens.`,
							`> ${emojis.icons_dleave} **Comprar**: </shop buy:${command.id}> \`<item> <quantidade?>\``,
							`> ${emojis.icons_djoin} **Vender**: </shop sell:${command.id}> \`<item> <quantidade?>\``
						),
					],
				}),
				k.separator.small,
				`## ${emojis.icons_todolist} — Catálogo`,
				...itemsDisplay,
			],
		});

		return interaction.reply({
			components: [container],
			flags: ['IsComponentsV2'],
		});
	}
}
