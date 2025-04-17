const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === "enviar_personalizado") {
        const modal = new Discord.ModalBuilder()
            .setCustomId("modal_enviar_personalizado")
            .setTitle("Envio via Webhook Personalizado")
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("webhook")
                        .setLabel("URL do Webhook")
                        .setPlaceholder("https://discord.com/api/webhooks/...")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(true)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("nome")
                        .setLabel("Nome do Webhook (opcional)")
                        .setPlaceholder("Nome de exibição")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId("avatar")
                        .setLabel("Avatar URL (opcional)")
                        .setPlaceholder("https://link-da-imagem.com/avatar.png")
                        .setStyle(Discord.TextInputStyle.Short)
                        .setRequired(false)
                )
            );

        await interaction.showModal(modal);
    }
});