const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const res = require('../../../utils/resTypes');

const client = require('../../../index');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'edit_images_modal') return;

    try {
        const online = interaction.fields.getTextInputValue('online_image');
        const offline = interaction.fields.getTextInputValue('offline_image');
        const carregando = interaction.fields.getTextInputValue('carregando_image');
        const manutencao = interaction.fields.getTextInputValue('manutencao_image');
        const auto = interaction.fields.getTextInputValue('auto_generate');

        const config = JSON.parse(fs.readFileSync(configPath));

        config.statusImages = {
            online: online || '',
            offline: offline || '',
            carregando: carregando || '',
            manutencao: manutencao || ''
        };

        config.autoGenerateImages = auto?.toLowerCase() === 'sim';

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

        await interaction.reply(
            res.success('Imagens atualizadas com sucesso!', { ephemeral: true })
        );
    } catch (err) {
        console.error('[EDIT_IMAGES] Erro ao processar modal:', err);
        await interaction.reply(
            res.error('Erro ao salvar as imagens. Verifique o console.', { ephemeral: true })
        );
    }
});