const Discord = require('discord.js');
const client = require('../../../index');

function setTimezone(date) {
    const offset = date.getTimezoneOffset();
    const offsetMs = offset * 60 * 1000;
    const utc = date.getTime() + offsetMs;
    const localDate = new Date(utc + (3600000 * -3));
    return localDate;
}

const usuariosEmEspera = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
    const channel = client.channels.cache.get("1283252217565937745");
    const member = newState.member;
    const desiredChannelId = "1263708796837167146";

    if (oldState.channel && oldState.channel.id === desiredChannelId && !newState.channel) {
        await handleUserLeft(channel, member);
    } else if (!oldState.channel && newState.channel && newState.channel.id === desiredChannelId) {
        await handleUserJoined(channel, member);
    } else if (oldState.channel && oldState.channel.id === desiredChannelId && newState.channel && newState.channel.id !== desiredChannelId) {
        await handleUserMoved(channel, member);
    }
});

async function handleUserLeft(channel, member) {
    const now = setTimezone(new Date());
    const horaSaida = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (usuariosEmEspera.has(member.id)) {
        const horaEntrada = usuariosEmEspera.get(member.id);
        const diffMs = now.getTime() - horaEntrada.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        const messages = await channel.messages.fetch({ limit: 1 });
        const lastMessage = messages.first();
        if (lastMessage.author.bot) {
            const embed = new Discord.EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('SAIU')
                .setDescription(`${member} saiu.\nHorário: **${horaSaida}**\nTempo total de espera: **${diffMinutes} minutos**`);

            await lastMessage.edit({ embeds: [embed] });
        }
        usuariosEmEspera.delete(member.id);
    }
}

async function handleUserJoined(channel, member) {
    const now = setTimezone(new Date());
    const horaEntrada = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const embed = new Discord.EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('ENTROU')
        .setDescription(`${member} está aguardando.\nHorário de entrada: **${horaEntrada}**`);

    await channel.send({ embeds: [embed], content: `<@&1141512716792635514>` });
    usuariosEmEspera.set(member.id, now);
}

async function handleUserMoved(channel, member) {
    const now = setTimezone(new Date());
    const horaMovimento = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();

    if (lastMessage.author.bot) {
        const horaEntrada = usuariosEmEspera.get(member.id);
        const diffMs = now.getTime() - horaEntrada.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        const embed = new Discord.EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('MOVIDO')
            .setDescription(`${member} foi movido\nHorário: **${horaMovimento}**\nTempo total de espera: **${diffMinutes} minutos**`);

        await lastMessage.edit({ embeds: [embed] });
    }
}
