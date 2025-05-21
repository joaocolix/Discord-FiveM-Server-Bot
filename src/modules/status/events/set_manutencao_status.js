const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');
const res = require('../../../utils/resTypes');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'set_manutencao_status') {
        const acao = interaction.values[0];

        try {
            const config = JSON.parse(fs.readFileSync(configPath));

            config.Server.status = acao === 'ativar' ? 'manutenção' : 'online';

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            await interaction.update(
                res.success(`Modo **${acao === 'ativar' ? 'manutenção ativado' : 'manutenção desativado'}** com sucesso!`, {
                    components: []
                })
            );

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

        } catch (err) {
            console.error('[MANUTENÇÃO] Erro ao atualizar status:', err);
            await interaction.update(
                res.error('Erro ao atualizar o status de manutenção.', {
                    components: []
                })
            );
        }

        return;
    }
});