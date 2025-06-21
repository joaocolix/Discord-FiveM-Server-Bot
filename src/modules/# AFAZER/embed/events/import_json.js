const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("import_json_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_import_${index}`)
            .setTitle("Importar JSON da Embed")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("json_embed")
                        .setLabel("Cole o JSON aqui")
                        .setPlaceholder('{ "title": "Exemplo", "description": "..." }')
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }
});