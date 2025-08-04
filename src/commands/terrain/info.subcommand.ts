import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Bot } from "../../structs/bot";
import { SubSlashCommand, SubSlashCommandOption } from "../../types/command";
import { db } from "../../models";
import emojis from "#emojis";
import seeds from "../../constants/seeds.json";
import { k } from "kompozr";

interface ProductData {
    id: string;
    emoji: string;
    display: string;
    quantity: number;
}

export default class TerrainInfoSubCommand extends SubSlashCommand {
    public reference = "terrain";
    public name = "info";
    public description = "Utilize esse comando para ver informações de um terreno da sua fazenda.";
    public options: SubSlashCommandOption[] = [
        {
            name: "terrain",
            description: "Insira aqui o id numérico do terreno que deseja ver as informações.",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
        },
    ];

    public async run(bot: Bot, interaction: ChatInputCommandInteraction<"cached" | "raw">) {
        const terrainId = interaction.options.getInteger("terrain") ?? 1;
        const terrain = (await db.terrain.find({ owner: interaction.user.id }))
            .at(terrainId - 1);
        if(!terrain) return interaction.reply({
            content: `> ${emojis.icons_outage} ${emojis.icons_text5} **Erro!** ${interaction.user}, você **inseriu um id** de **terreno inválido**.`,
            flags: ["Ephemeral"]
        })

        const currentTime = Date.now();

        const board = Array.from({ length: terrain.height }, (_, i) => {
            const slots = terrain.slots.slice(i * terrain.width, (i + 1) * terrain.width);
            const line = slots.map(slot => {
               const isValidSeed = Object.keys(seeds).includes(slot.seed);
               if (!isValidSeed) return emojis[slot.seed as keyof typeof emojis];

               const isReadyToCollect = currentTime >= slot.endsAt;
               const seed = seeds[slot.seed as keyof typeof seeds];
               const emojiName = isReadyToCollect ? seed.product_emoji : seed.emoji;
               return emojis[emojiName as keyof typeof emojis];
            });

            return `> ${line.join(' ')}`;
        })

        const products: ProductData[] = [];
        for (const slot of terrain.slots) {
            const isValidSeed = Object.keys(seeds).includes(slot.seed);
            if (!isValidSeed) continue;

            const seed = seeds[slot.seed as keyof typeof seeds];
            const isReadyToCollect = currentTime >= slot.endsAt;
            const productId = isReadyToCollect ? seed.product_id : seed.seed_id;
            const emojiName = isReadyToCollect ? seed.product_emoji : seed.emoji;
            const emoji = emojis[emojiName as keyof typeof emojis];

            const product: ProductData = products.find(p => p.id === productId) || {
               id: productId,
               display: `**${seed.product_display} [ \`${isReadyToCollect ? "Pronto!" : "Em Andamento"}\` ]**`,
               emoji,
               quantity: 0
            };

            product.quantity += 1;

            const index = products.findIndex(p => p.id === productId);
            if (index < 0) products.push(product);
            else products[index] = product;
        }

        const productsBoard = products.map(p => `> \`${p.quantity}x\` ${p.emoji} ${p.display}`).join("\n") || "\`...nenhum\`"

        const container = k.container({
            color: "Aqua",
            components: [
                k.text(
                    `# ${emojis.icons_farm} — Fazenda de ${interaction.user.displayName} | Terreno: ${terrainId}`,
                    `-# ${emojis.icons_text1} Aqui você pode ver o andamento da sua plantação.`,
                    board.join('\n')
                ),
                k.separator.small,
                k.text(
                    `## ${emojis.icons_todolist} — Produtos:`,
                    productsBoard
                )
            ]
        })

       return interaction.reply({
           components: [container],
           flags: ["IsComponentsV2"]
       })
    }
}
