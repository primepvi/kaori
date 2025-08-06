import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { abbreviate } from 'util-stunks';
import emojis from '#emojis';
import { ItemManager } from '@/structs/item-manager';
import shopItems from '../../constants/shop.json' with { type: 'json' };
import { db } from '../../models';
import type { Bot } from '../../structs/bot';
import {
	SubSlashCommand,
	type SubSlashCommandOption,
} from '../../types/command';

const sellItemChoices = Object.values(shopItems)
	.filter((item) => item.operation === 'sell')
	.map((rawItem) => {
		const item = ItemManager.getItem(rawItem.item);
		return { name: item.display, value: item.id };
	});

export default class ShopSellSubCommand extends SubSlashCommand {
	public reference = 'shop';
	public name = 'sell';
	public description = 'Utilize esse comando para vender um item na loja.';
	public options: SubSlashCommandOption[] = [
		{
			name: 'item',
			description: 'Insira aqui o nome do item que deseja comprar.',
			type: ApplicationCommandOptionType.String,
			choices: sellItemChoices,
			required: true,
		},
		{
			name: 'quantity',
			description: 'Insira aqui a quantidade de item que deseja comprar.',
			type: ApplicationCommandOptionType.Integer,
			required: false,
			min_value: 1,
		},
	];

	public async run(
		_: Bot,
		interaction: ChatInputCommandInteraction<'cached' | 'raw'>
	) {
		const itemId = interaction.options.getString('item', true);
		const itemQuantity = interaction.options.getInteger('quantity') ?? 1;
		const item = ItemManager.getItem(itemId);

		const userItem = await db.item.findOne({
			id: itemId,
			owner: interaction.user.id,
		});
		if (!userItem || userItem.quantity < itemQuantity)
			return interaction.reply({
				content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **não possui** \`x${itemQuantity}\` ${item.format()} para **vender**.`,
			});

		const price = item.price * itemQuantity;

		await db.user.findByIdAndUpdate(interaction.user.id, {
			$inc: { coins: price },
		});

		userItem.quantity -= itemQuantity;
		await userItem.save();

		return interaction.reply(
			`> ${emojis.icons_correct} ${emojis.icons_text5} **Vendido!** ${interaction.user}, você **vendeu** com **sucesso** \`x${itemQuantity}\` ${item.format()} por \`${abbreviate(price)}\` ${emojis.icons_coin} **[ \`Moedas\` ]**!`
		);
	}
}
