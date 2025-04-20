const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId.startsWith('edit_config_modal:')) {
        const field = interaction.customId.split(':')[1];
        const newValue = interaction.fields.getTextInputValue('new_value');

        try {
            const currentConfig = JSON.parse(fs.readFileSync(configPath));

            if (field === 'updateInterval') {
                const minutes = parseInt(newValue);
                if (isNaN(minutes) || minutes <= 0) {
                    return await interaction.update({
                        content: `O valor precisa ser um número maior que zero.`,
                        components: []
                    });
                }
                currentConfig.Server.updateInterval = minutes;
            } else {
                currentConfig.Server[field] = newValue;
            }

            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4));

            await interaction.update({
                content: `Campo **${field}** atualizado com sucesso!`,
                components: []
            });

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

            if (typeof updateStatus.setDynamicInterval === 'function') {
                updateStatus.setDynamicInterval();
            }
        } catch (err) {
            console.error('[CONFIG] Erro ao atualizar campo:', err);
            await interaction.update({
                content: `Erro ao atualizar o campo **${field}**.`,
                components: []
            });
        }
    }
});