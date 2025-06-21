const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === "add_button") {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_add_button")
            .setTitle("Adicionar Botão Personalizado")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("texto")
                        .setLabel("Texto do Botão")
                        .setPlaceholder("Ex: Clique aqui")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("url")
                        .setLabel("URL do Botão (obrigatório se for Link)")
                        .setPlaceholder("https://...")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("emoji")
                        .setLabel("Emoji (opcional)")
                        .setPlaceholder("😄")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});