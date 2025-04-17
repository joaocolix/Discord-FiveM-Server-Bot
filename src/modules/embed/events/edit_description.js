const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("edit_description_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_description_${index}`)
            .setTitle("Editar Descrição da Embed")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("descricao")
                        .setLabel("Descrição")
                        .setPlaceholder("Digite a descrição da embed")
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

        await interaction.showModal(modal);
    }
});