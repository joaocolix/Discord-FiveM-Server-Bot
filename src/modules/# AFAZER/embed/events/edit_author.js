const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("edit_author_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_author_${index}`)
            .setTitle("Editar Autor da Embed")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("nome")
                        .setLabel("Nome do Autor")
                        .setPlaceholder("Digite o nome do autor")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("icone")
                        .setLabel("URL do Ícone (opcional)")
                        .setPlaceholder("https://link-da-imagem.com/icone.png")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("url")
                        .setLabel("URL do Autor (opcional)")
                        .setPlaceholder("https://exemplo.com")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});