const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'botao_edit') {
        const index = client.buttonEditSelection[interaction.user.id];
        if (index === undefined) {
            return interaction.reply({ content: 'Você precisa selecionar um botão antes.', ephemeral: true });
        }

        const modal = new Discord.ModalBuilder()
            .setCustomId(`edit_button_modal:${index}`)
            .setTitle(`Editar Botão ${parseInt(index) + 1}`);

        const inputLabel = new Discord.TextInputBuilder()
            .setCustomId('label')
            .setLabel('Texto do botão')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputUrl = new Discord.TextInputBuilder()
            .setCustomId('url')
            .setLabel('URL do botão')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmoji = new Discord.TextInputBuilder()
            .setCustomId('emoji')
            .setLabel('Emoji (opcional)')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('Ex: 🔥 ou emoji_id');

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputLabel),
            new Discord.ActionRowBuilder().addComponents(inputUrl),
            new Discord.ActionRowBuilder().addComponents(inputEmoji)
        );

        await interaction.showModal(modal);
        return;
    }
});