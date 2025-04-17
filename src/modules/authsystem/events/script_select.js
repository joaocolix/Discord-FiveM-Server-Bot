const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    const [_, tipo, userId, servidorEncoded] = interaction.customId.split('_');
    const servidor = decodeURIComponent(servidorEncoded);

    if (tipo === 'script') {
        const scriptSelecionado = interaction.values[0];

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`alterar_ip|${userId}|${encodeURIComponent(scriptSelecionado)}|${encodeURIComponent(servidor)}`)
                .setLabel('Alterar IP')
                .setStyle(Discord.ButtonStyle.Secondary),
            new Discord.ButtonBuilder()
                .setCustomId(`alterar_tempo|${userId}|${encodeURIComponent(scriptSelecionado)}|${encodeURIComponent(servidor)}`)
                .setLabel('Alterar Tempo')
                .setStyle(Discord.ButtonStyle.Primary)
        );        

        await interaction.update({
            content: `Script selecionado: **${scriptSelecionado}** no servidor **${servidor}**\nAgora escolha o que deseja alterar:`,
            components: [row]
        });
    }
});
