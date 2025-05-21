const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const [_, tipo, userId] = interaction.customId.split('_');

    if (tipo === 'server') {
        const servidorSelecionado = interaction.values[0];

        const licenses = JSON.parse(fs.readFileSync(licensesPath));
        const userLicenses = licenses[userId] || [];

        const scripts = userLicenses
            .filter(l => l.servidor === servidorSelecionado)
            .map(l => l.script);

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`select_script_${userId}_${encodeURIComponent(servidorSelecionado)}`)
            .setPlaceholder('Escolha um script')
            .addOptions(
                [...new Set(scripts)].map(s => ({
                    label: s,
                    value: s
                }))
            );

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.update({
            content: `Servidor selecionado: **${servidorSelecionado}**\nAgora escolha o script:`,
            components: [row]
        });
    }
});
