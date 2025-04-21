const Discord = require('discord.js');
const client = require('../../../index');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'auth_licenses') {
        const embed = new Discord.EmbedBuilder()
            .setDescription('Use um dos comandos abaixo para gerenciar suas licenças:')
            .addFields(
                { name: 'Adicionar', value: '`/comando`', inline: false },
                { name: 'Cancelar', value: '`/comando`', inline: false },
                { name: 'Gerenciar', value: '`/comando`', inline: false },
                { name: 'Transferir', value: '`/comando`', inline: false },
            )

        await interaction.reply({ embeds: [embed], flags: 1 << 6 });
    }
});
