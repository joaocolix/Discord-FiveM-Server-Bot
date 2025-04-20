const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_button_to_edit') {
        const index = interaction.values[0];
        client.buttonEditSelection[interaction.user.id] = index;

        await interaction.deferUpdate();
        return;
    }
});