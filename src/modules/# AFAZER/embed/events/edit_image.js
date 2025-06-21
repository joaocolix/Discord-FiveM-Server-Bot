const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("edit_image_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_image_${index}`)
            .setTitle("Editar Imagem e Thumbnail")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("imagem")
                        .setLabel("URL da Imagem Principal (opcional)")
                        .setPlaceholder("https://link-da-imagem.com/imagem.png")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("thumb")
                        .setLabel("URL da Thumbnail (opcional)")
                        .setPlaceholder("https://link-da-imagem.com/thumb.png")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});