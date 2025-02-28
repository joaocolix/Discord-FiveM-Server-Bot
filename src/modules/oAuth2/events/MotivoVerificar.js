const Discord = require('discord.js')
const client = require('../../../index')

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'resp_verificar') {
        await interaction.reply({ content: `A verificação serve para garantirmos uma experiência aprimorada em nosso servidor, assegurando a integração entre o seu jogo e o nosso Discord.`, ephemeral: true });
    }
});