const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("edit_footer_")) {
        const index = parseInt(interaction.customId.split("_")[2]);

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_footer_${index}`)
            .setTitle("Editar Rodapé da Embed")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("texto")
                        .setLabel("Texto do Rodapé")
                        .setPlaceholder("Digite o texto do rodapé")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("icone")
                        .setLabel("URL do Ícone (opcional)")
                        .setPlaceholder("https://link-da-imagem.com/icon.png")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});

