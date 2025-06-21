const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("edit_title_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_title_${index}`)
            .setTitle("Editar Título da Embed")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("titulo")
                        .setLabel("Título")
                        .setPlaceholder("Digite o título da embed")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("url")
                        .setLabel("URL (opcional)")
                        .setPlaceholder("https://exemplo.com")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});