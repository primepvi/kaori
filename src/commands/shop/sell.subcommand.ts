import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand, SubSlashCommandOption } from "../../types/command";
import shopItems from "../../constants/shop.json";

const sellItemChoices = Object.values(shopItems)
    .filter(item => item.operation === "sell")
    .map(item => ({ name: item.display, value: item.id }));

export default class ShopSellSubCommand extends SubSlashCommand {
    public reference = "shop";
    public name = "sell";
    public description = "Utilize esse comando para vender um item na loja.";
    public options: SubSlashCommandOption[] = [
        {
            name: "item",
            description: "Insira aqui o nome do item que deseja comprar.",
            type: ApplicationCommandOptionType.String,
            choices: sellItemChoices,
            required: true
        },
        {
            name: "quantity",
            description: "Insira aqui a quantidade de item que deseja comprar.",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            min_value: 1,
        }
    ];

    public run(_: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        return interaction.reply("Não fiz ainda newba.");
    }
}
