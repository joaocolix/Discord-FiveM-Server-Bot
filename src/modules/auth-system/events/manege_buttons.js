const Discord = require('discord.js');
const client = require('../../../index');
const fs = require('fs');
const path = require('path');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, userId, scriptRaw, servidorRaw] = interaction.customId.split('|');
    const script = decodeURIComponent(scriptRaw);
    const servidor = decodeURIComponent(servidorRaw);

    if (!['alterar_ip', 'alterar_tempo'].includes(action)) return;

    let licenses = {};
    if (fs.existsSync(licensesPath)) {
        licenses = JSON.parse(fs.readFileSync(licensesPath));
    }

    const userLicenses = licenses[userId] || [];
    const licenca = userLicenses.find(l =>
        l.script === script && l.servidor === servidor
    );

    if (!licenca) {
        return interaction.reply({
            content: 'Licença não encontrada.',
            flags: 1 << 6
        });
    }

    const field = action === 'alterar_ip' ? 'ip' : 'tempo';

    const modal = new Discord.ModalBuilder()
        .setCustomId(`modal_edit|${field}|${userId}|${encodeURIComponent(script)}|${encodeURIComponent(servidor)}`)
        .setTitle(`Alterar ${field.toUpperCase()} da Licença`);

    const input = new Discord.TextInputBuilder()
        .setCustomId('campo_valor')
        .setLabel(`Novo ${field.toUpperCase()}`)
        .setStyle(Discord.TextInputStyle.Short)
        .setRequired(true)
        .setValue(licenca[field] || '');

    const row = new Discord.ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    await interaction.showModal(modal);
});