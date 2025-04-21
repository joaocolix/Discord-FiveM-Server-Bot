const client = require('../../../index');
require('dotenv').config();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('verify_status_')) {
        const userId = interaction.customId.replace('verify_status_', '');
        const guild = client.guilds.cache.get(process.env.GUILD_ID);

        if (!guild) {
            console.log(`Erro: Servidor ${process.env.GUILD_ID} não encontrado!`);
            return await interaction.reply({ content: 'O servidor não foi encontrado.', flags: 1 << 6 });
        }

        try {
            const member = await guild.members.fetch(userId);

            if (member) {
                return await interaction.reply({ content: `O usuário **${member.user.username}** ainda está verificado no servidor.`, flags: 1 << 6 });
            }
        } catch (error) {
            console.error(`Erro ao buscar usuário ${userId}:`, error.message);
            return await interaction.reply({ content: `O usuário não está mais no servidor ou não pôde ser encontrado.`, flags: 1 << 6 });
        }
    }
});