const Discord = require('discord.js')
const client = require('../../../index')
const axios = require('axios');
const moment = require('moment-timezone');
const colors = require('colors');
const config = require('../../../configs/server.json');

let lastUpdatedTime = moment().tz('America/Sao_Paulo').format('HH:mm');

const phrases = [
    'a cidade ta aberta'
];

client.on('messageCreate', async (message) => {
    if (phrases.some(phrase => message.content.toLowerCase().includes(phrase))) {
        const statusMessage = await message.channel.send('Atualizando status...'); 
        updateStatus(message.channel, statusMessage); 
    }
});

async function updateStatus(channel, statusMessage) {

    let data = { players: "" };

    function getCountdown() {
        const now = moment().tz('America/Sao_Paulo');
        const targetEvening = moment().tz('America/Sao_Paulo').set({ hour: 18, minute: 0, second: 0, millisecond: 0 });
        const targetMorning = moment().tz('America/Sao_Paulo').set({ hour: 6, minute: 0, second: 0, millisecond: 0 });

        let targetTime;

        if (now.isBefore(targetMorning)) {
            targetTime = targetMorning;
        } else if (now.isBefore(targetEvening)) {
            targetTime = targetEvening;
        } else {
            targetTime = targetMorning.add(1, 'day');
        }

        const duration = moment.duration(targetTime.diff(now));
        return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    }

    async function update_info() {
        await axios.get(`http://${config.Server.serverIp}:${config.Server.serverPort}/players.json`).then(response => {
            data.players = response.data.length;
            lastUpdatedTime = moment().tz('America/Sao_Paulo').format('HH:mm');
        }).catch(err => {
            data.players = -1;
        });
    }

    await update_info();

    const embed = new Discord.EmbedBuilder()
        .setDescription(data.players === -1 ? '## <:295:1275200299522588796> SERVIDOR OFFLINE' : '## <:313:1275206746167836672> SERVIDOR ONLINE')
        .setColor('#302c34')
        .addFields(
            { name: '<:29997:1275207233629851779> IP SERVIDOR:', value: `\`\`\`${config.Server.serverConnect}\`\`\``, inline: false },
            { name: `<:25:1275200009037418496> JOGADORES:`, value: `\`\`\`${data.players}\`\`\``, inline: true },
            { name: '<:2997:1275199423554654288> REINÍCIO:', value: `\`\`\`${getCountdown()}\`\`\``, inline: true },
        )
        .setFooter({ text: `Última vez atualizado: ${lastUpdatedTime} (UTC-3)` })
        .setImage("https://media.discordapp.net/attachments/1271651923530879078/1275112009209352295/Design_sem_nome.png?ex=66c4b419&is=66c36299&hm=6a74dbcd050a0be1ce148751e639096719682514a17a339ccbe24faa862727af&=&format=webp&quality=lossless");
    
    const btn = new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Link)
        .setEmoji("<:3_:1275224530637553694>")
        .setURL("https://servers.fivem.net");

    const btn2 = new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Link)
        .setEmoji("<:2_:1275224533103677490>")
        .setURL("https://www.instagram.com/euphoriarp.gg");    

    const btn4 = new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Link)
        .setEmoji("<:1_:1275224534278209590>")
        .setURL("https://loja.euphoriagg.com/");

    const row = new Discord.ActionRowBuilder().addComponents(btn, btn2, btn4);

    try {
        await channel.send({
            components: [row],
            embeds: [embed]
        });
        await statusMessage.delete();
    } catch (err) {
    }

    setInterval(async () => {
        
        await update_info();

        embed.setFields(
            { name: '<:29997:1275207233629851779> IP SERVIDOR:', value: `\`\`\`${config.Server.serverConnect}\`\`\``, inline: false },
            { name: `<:25:1275200009037418496> JOGADORES:`, value: `\`\`\`${data.players}\`\`\``, inline: true },
            { name: '<:2997:1275199423554654288> REINÍCIO:', value: `\`\`\`${getCountdown()}\`\`\``, inline: true },
        );
        embed.setFooter({ text: `Última vez atualizado: ${lastUpdatedTime} (UTC-3)` });

        try {
            const messages = await channel.messages.fetch({ limit: 1 });
            for (const msg of messages.values()) {
                await msg.edit({ embeds: [embed] });
            }
        } catch (err) {
        }
    }, 60000);
}