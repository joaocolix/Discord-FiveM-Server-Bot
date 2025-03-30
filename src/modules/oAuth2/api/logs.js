const axios = require('axios');
const cfg = require('../../../configs/client.json');

async function sendLogMessage(userId, username, email, ip, data) {
    const channelId = '1348399222008840313';

    const embed = {
        title: 'Verificação Concluida',
        color: 0x00ff00,
        fields: [
            { name: 'Usuário', value: `**${username}** (\`${userId}\`)`, inline: false },
            { name: 'E-mail', value: email, inline: false },
            { name: 'IP', value: `\`${ip}\``, inline: false },
            { name: 'Data', value: data, inline: false },
        ],
        timestamp: new Date(),
    };

    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Consultar',
                    style: 5,
                    url: `https://iplookup.flagfox.net/?ip=${ip}`,
                },
                {
                    type: 2,
                    label: 'Verificar',
                    style: 1,
                    custom_id: `verify_status_${userId}`,
                }
            ]
        }
    ];

    try {
        await axios.post(
            `https://discord.com/api/v10/channels/${channelId}/messages`,
            { embeds: [embed], components },
            {
                headers: {
                    Authorization: `Bot ${cfg.client.token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error(`Erro ao enviar log de autenticação: ${error.response?.data || error.message}`);
    }
}

module.exports = { sendLogMessage };