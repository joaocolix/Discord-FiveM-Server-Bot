const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'copy_pix') {
        interaction.channel.sendTyping();
        await interaction.reply({ content: `pagamentos@euphoriacidade.com`, ephemeral: true });
    }
});