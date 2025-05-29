const axios = require('axios');
const moment = require('moment-timezone');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');

const client = require('../../../index');

let intervalInstance;

async function updateStatusMessage() {
    let config;

    try {
        config = JSON.parse(fs.readFileSync(configPath));
    } catch (err) {
        return;
    }

    let msg = client.statusMessage;

    if (!msg) {
        try {
            if (!config.Server.statusChannelId || !config.Server.statusMessageId) return;
            const channel = await client.channels.fetch(config.Server.statusChannelId);
            msg = await channel.messages.fetch(config.Server.statusMessageId);
            client.statusMessage = msg;
        } catch {
            return;
        }
    }

    let players = -1;
    let lastUpdatedTime = moment().tz('America/Sao_Paulo').format('HH:mm');
    let status = config.Server.status?.toLowerCase() || 'online';

    try {
        const res = await axios.get(`http://${config.Server.serverIp}:${config.Server.serverPort}/players.json`);
        players = res.data.length;
    } catch {
        status = 'offline';
        players = -1;
    }

    const now = moment().tz('America/Sao_Paulo');
    const targetEvening = moment().tz('America/Sao_Paulo').set({ hour: 18, minute: 0 });
    const targetMorning = moment().tz('America/Sao_Paulo').set({ hour: 6, minute: 0 });

    let targetTime = now.isBefore(targetMorning)
        ? targetMorning
        : now.isBefore(targetEvening)
            ? targetEvening
            : targetMorning.add(1, 'day');

    const duration = moment.duration(targetTime.diff(now));
    const countdown = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;

    const statusColorMap = config.statusColors || {
        online: '#00FF47',
        offline: '#FF3333',
        manutenção: '#FFD700',
        carregando: '#00C8FF'
    };

    const corEmbed = statusColorMap[status] || '#FFFFFF';

    let bannerBuffer;
    if (config.autoGenerateImages !== false) {
        bannerBuffer = await gerarBanner({
            status,
            jogadores: players.toString(),
            reinicio: countdown
        });
    } else {
        const imagePath = config.statusImages?.[status];
        if (!imagePath || !fs.existsSync(imagePath)) {
            console.warn(`[STATUS] Imagem personalizada para status '${status}' não encontrada.`);
            return;
        }
        bannerBuffer = fs.readFileSync(imagePath);
    }

    const bannerAttachment = new Discord.AttachmentBuilder(bannerBuffer, { name: 'status.png' });

    const embed = new Discord.EmbedBuilder()
        .setColor(corEmbed)
        .addFields(
            { name: 'IP SERVIDOR:', value: `\`\`\`${config.Server.serverConnect}\`\`\``, inline: false },
            { name: 'JOGADORES:', value: `\`\`\`${players === -1 ? 'Indisponível' : players}\`\`\``, inline: true },
            { name: 'REINÍCIO:', value: `\`\`\`${countdown}\`\`\``, inline: true }
        )
        .setFooter({ text: `Última vez atualizado: ${lastUpdatedTime} (UTC-3)` })
        .setImage('attachment://status.png');

    const btns = (config.Server.buttons || []).slice(0, 3).filter(Boolean); // remove nulls
    const row = new Discord.ActionRowBuilder();

    btns.forEach(btn => {
        const button = new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel(btn.label)
            .setURL(btn.url);

        if (btn.emoji) button.setEmoji(btn.emoji);

        row.addComponents(button);
    });

    const messagePayload = {
        embeds: [embed],
        files: [bannerAttachment]
    };

    if (btns.length > 0) {
        messagePayload.components = [row];
    }

    try {
        await msg.edit(messagePayload);
    } catch (err) {
        if (err.code === 10008) {
            config.Server.statusMessageId = null;
            config.Server.statusChannelId = null;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
            client.statusMessage = null;
        }
    }
}

function setDynamicInterval() {
    if (intervalInstance) clearInterval(intervalInstance);

    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        const intervalMs = (config.Server.updateInterval || 1) * 60 * 1000;
        intervalInstance = setInterval(updateStatusMessage, intervalMs);
    } catch (err) {
        console.error('[INTERVAL] Erro ao configurar intervalo:', err);
    }
}

client.on('ready', () => {
    setDynamicInterval();
});

module.exports.forceUpdate = updateStatusMessage;
module.exports.setDynamicInterval = setDynamicInterval;
