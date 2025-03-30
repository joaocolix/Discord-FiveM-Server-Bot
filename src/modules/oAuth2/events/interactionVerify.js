const client = require('../../../index');
const cfg = require('../../../configs/client.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('verify_status_')) {
        const userId = interaction.customId.replace('verify_status_', '');
        const guild = client.guilds.cache.get(cfg.client.guild_id);

        if (!guild) {
            console.log(`Erro: Servidor ${cfg.client.guild_id} não encontrado!`);
            return await interaction.reply({ content: 'O servidor não foi encontrado.', ephemeral: true });
        }

        try {
            const member = await guild.members.fetch(userId);

            if (member) {
                return await interaction.reply({ content: `O usuário **${member.user.username}** ainda está verificado no servidor.`, ephemeral: true });
            }
        } catch (error) {
            console.error(`Erro ao buscar usuário ${userId}:`, error.message);
            return await interaction.reply({ content: `O usuário não está mais no servidor ou não pôde ser encontrado.`, ephemeral: true });
        }
    }
});