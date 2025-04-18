const Discord = require('discord.js');
const client = require('../../../index');

const sourceGuildId = '1136112924021231727';
const targetGuildId = '1140469447866470530';
const sourceChannelId = '1217937168023027843';

// IDs dos cargos na blacklist
const blacklistRoles = ['1141512716792635514', '1187530218357923940'];

client.on('messageCreate', async (message) => {
    // Verificar se a mensagem é do servidor e canal corretos
    if (message.guildId !== sourceGuildId || message.channelId !== sourceChannelId) {
        return;
    }

    // Regex para validar IDs com 18 ou 19 dígitos e capturar os dados
    const regex = /^(\d{18,19}) #(\d+) (.+)$/;
    const match = message.content.match(regex);

    if (match) {
        const userId = match[1];
        const inGameId = match[2];
        const inGameName = match[3];

        const targetGuild = client.guilds.cache.get(targetGuildId);
        if (!targetGuild) {
            return;
        }

        try {
            const member = await targetGuild.members.fetch(userId);
            if (member) {
                // Verificar se o membro possui algum cargo da blacklist
                const hasBlacklistedRole = member.roles.cache.some(role =>
                    blacklistRoles.includes(role.id)
                );

                if (hasBlacklistedRole) {
                    return;
                }

                await member.setNickname(`${inGameId}・${inGameName}`);
            } else {
                console.log(`Membro com ID ${userId} não encontrado no servidor ${targetGuildId}`);
            }
        } catch (error) {
            console.error(`Erro ao processar o usuário com ID ${userId}:`, error);
        }
    } else {
        console.log('Mensagem não corresponde ao formato esperado.');
    }
});