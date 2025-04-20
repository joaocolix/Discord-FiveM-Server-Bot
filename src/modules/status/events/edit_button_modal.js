const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId.startsWith('edit_button_modal:')) {
        const index = parseInt(interaction.customId.split(':')[1]);
        const label = interaction.fields.getTextInputValue('label');
        const url = interaction.fields.getTextInputValue('url');
        const emoji = interaction.fields.getTextInputValue('emoji');

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            if (!config.Server.buttons) config.Server.buttons = [];

            config.Server.buttons[index] = {
                label: label.trim(),
                url: url.trim(),
                emoji: emoji?.trim() || null
            };

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            await interaction.deferUpdate(); 

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

        } catch (err) {
            console.error('[BOTÕES] Erro ao salvar botão:', err);
            await interaction.reply({
                content: 'Erro ao salvar o botão.',
                ephemeral: true
            });
        }

        return;
    }
});