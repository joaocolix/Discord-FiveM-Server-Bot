const axios = require('axios');
const { QuickDB } = require('quick.db');
global.db = new QuickDB();

const twitchClientId = '9iedb0a19qna4a2cp3xpwpl1lsq3jp'; // Coloque o Client ID da Twitch
const twitchClientSecret = 'akvx0wk1ndpdj04jrar35v19ehtkvw'; // Coloque o Client Secret da Twitch
const roleId = '1246535968786350275'; // ID do cargo que deseja atribuir quando o usuário iniciar a live
const guildId = '1140469447866470530'; // ID do servidor Discord onde deseja aplicar as ações
const channelId = '1271651923530879078'; // ID do canal onde o bot enviará a mensagem da live

let twitchToken = '';

async function getTwitchToken() {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: twitchClientId,
                client_secret: twitchClientSecret,
                grant_type: 'client_credentials'
            }
        });
        twitchToken = response.data.access_token;
        console.log(`[CARREGADO] API: Twitch`.green);
    } catch (error) {
        console.error('Erro ao obter o token da Twitch:', error.response ? error.response.data : error.message);
    }
}

async function checkLiveStatus(client) {
    if (!twitchToken) {
        await getTwitchToken();
    }

    const users = await db.get('twitchUsers') || [];

    for (const user of users) {
        try {
            const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${user.username}`, {
                headers: {
                    'Client-ID': twitchClientId,
                    'Authorization': `Bearer ${twitchToken}`
                }
            });

            const guild = await client.guilds.fetch(guildId);
            const member = await guild.members.fetch(user.discordId);

            if (response.data.data.length > 0) {
                const stream = response.data.data[0];
                const messageSent = await db.get(`twitchUser_${user.username}.messageSent`);

                if (stream.type === 'live' && !user.live) {
                    await db.set(`twitchUser_${user.username}.live`, true);

                    if (!messageSent) {
                        await db.set(`twitchUser_${user.username}.messageSent`, true);
                        if (member && !member.roles.cache.has(roleId)) {
                            await member.roles.add(roleId);
                        }
                        const channel = await client.channels.fetch(channelId);
                        await channel.send(`${member} está ao vivo! Assista em: https://www.twitch.tv/${user.username}`)
                            .catch(error => console.error(`Erro ao enviar mensagem: ${error.message}`));
                    }
                }
            } else if (user.live) {
                await db.set(`twitchUser_${user.username}.live`, false);
                await db.set(`twitchUser_${user.username}.messageSent`, false); // Reseta o estado da mensagem

                if (member && member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar status da live:', error.response ? error.response.data : error.message);
            if (error.response && error.response.status === 401) {
                await getTwitchToken(); // Renovar o token se estiver inválido
            }
        }
    }
}

module.exports = {
    getTwitchToken,
    checkLiveStatus,
};
