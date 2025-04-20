const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'botao_remover') {
        const index = client.buttonEditSelection[interaction.user.id];
        if (index === undefined) {
            return interaction.reply({ content: 'Você precisa selecionar um botão antes.', ephemeral: true });
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            if (config.Server.buttons && config.Server.buttons[index]) {
                config.Server.buttons.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

                await interaction.deferUpdate(); 

                const updateStatus = require('./updateStatusMessage');
                if (typeof updateStatus.forceUpdate === 'function') {
                    await updateStatus.forceUpdate();
                }
            } else {
                await interaction.reply({ content: 'Esse botão já está vazio.', ephemeral: true });
            }
        } catch (err) {
            console.error('[BOTÕES] Erro ao remover botão:', err);
            await interaction.reply({ content: 'Erro ao remover o botão.', ephemeral: true });
        }

        return;
    }
});