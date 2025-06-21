const Discord = require("discord.js");
const client = require("../../../index");
const userEmbeds = require("../cache/userEmbeds");

client.on("interactionCreate", async (interaction) => {
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "editar_embed_select") {
            const userId = interaction.user.id;
            const embeds = userEmbeds.get(userId);

            if (!embeds || embeds.length === 0) {
                return interaction.update({
                    content: "Nenhuma embed foi encontrada.",
                    components: [],
                });
            }

            const index = parseInt(interaction.values[0].split("_")[1]);
            const embedAtual = embeds[index];

            const rowEditar1 = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder().setCustomId(`edit_title_${index}`).setLabel("Título").setStyle(1),
                new Discord.ButtonBuilder().setCustomId(`edit_description_${index}`).setLabel("Descrição").setStyle(1),
                new Discord.ButtonBuilder().setCustomId(`edit_color_${index}`).setLabel("Cor").setStyle(1),
                new Discord.ButtonBuilder().setCustomId(`edit_author_${index}`).setLabel("Autor").setStyle(1),
                new Discord.ButtonBuilder().setCustomId(`edit_image_${index}`).setLabel("Imagem/Thumb").setStyle(1)
            );

            const rowEditar2 = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder().setCustomId(`edit_footer_${index}`).setLabel("Rodapé").setStyle(1),
                new Discord.ButtonBuilder().setCustomId(`import_json_${index}`).setLabel("Importar JSON").setStyle(2),
                new Discord.ButtonBuilder().setCustomId(`export_json_${index}`).setLabel("Exportar JSON").setStyle(2),
                new Discord.ButtonBuilder().setCustomId("voltar_menu").setLabel("Voltar").setStyle(3),
                new Discord.ButtonBuilder().setCustomId(`apagar_embed_${index}`).setLabel("Apagar").setStyle(4)
            );

            await interaction.update({
                embeds: [embedAtual],
                components: [rowEditar1, rowEditar2]
            });
        }
    }

});
