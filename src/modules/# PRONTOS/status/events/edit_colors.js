const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const res = require('../../../utils/resTypes');

const client = require('../../../index');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'edit_colors_modal') return;

    try {
        const online = interaction.fields.getTextInputValue('online');
        const offline = interaction.fields.getTextInputValue('offline');
        const carregando = interaction.fields.getTextInputValue('carregando');
        const manutencao = interaction.fields.getTextInputValue('manutencao');

        const config = JSON.parse(fs.readFileSync(configPath));

        config.statusColors = {
            online: online || '#00FF47',
            offline: offline || '#FF3333',
            carregando: carregando || '#00C8FF',
            manutencao: manutencao || '#FFD700'
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        await interaction.reply(
            res.success('Cores atualizadas com sucesso!', { ephemeral: true })
        );
    } catch (err) {
        console.error('[EDIT_COLORS] Erro ao processar modal:', err);
        await interaction.reply(
            res.error('Erro ao salvar as cores. Verifique o console.', { ephemeral: true })
        );
    }
});