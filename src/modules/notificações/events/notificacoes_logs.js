const Discord = require("discord.js");
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

function loadLogData() {
    const filePath = path.resolve(__dirname, "../data/canais.json");
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Entrar no servidor
client.on("guildMemberAdd", async member => {
    const data = loadLogData();
    const canalId = data[member.guild.id]?.entrada;
    if (canalId) {
        const canal = member.guild.channels.cache.get(canalId);
        if (canal) canal.send(`🔔 ${member.user.tag} entrou no servidor!`);
    }
});

// Sair do servidor
client.on("guildMemberRemove", async member => {
    const data = loadLogData();
    const canalId = data[member.guild.id]?.saida;
    if (canalId) {
        const canal = member.guild.channels.cache.get(canalId);
        if (canal) canal.send(`👋 ${member.user.tag} saiu do servidor.`);
    }
});

// Ban
client.on("guildBanAdd", async ban => {
    const data = loadLogData();
    const canalId = data[ban.guild.id]?.ban;
    if (canalId) {
        const canal = ban.guild.channels.cache.get(canalId);
        if (canal) canal.send(`🚫 ${ban.user.tag} foi banido.`);
    }
});

// Desban
client.on("guildBanRemove", async ban => {
    const data = loadLogData();
    const canalId = data[ban.guild.id]?.unban;
    if (canalId) {
        const canal = ban.guild.channels.cache.get(canalId);
        if (canal) canal.send(`✅ ${ban.user.tag} foi desbanido.`);
    }
});

// Mensagem editada
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author?.bot) return;
    const data = loadLogData();
    const canalId = data[oldMessage.guild?.id]?.edit;
    if (canalId) {
        const canal = oldMessage.guild.channels.cache.get(canalId);
        if (canal) canal.send(`✏️ Mensagem editada por ${oldMessage.author.tag}:\n**Antes:** ${oldMessage.content}\n**Depois:** ${newMessage.content}`);
    }
});

// Mensagem deletada
client.on("messageDelete", async message => {
    if (message.author?.bot) return;
    const data = loadLogData();
    const canalId = data[message.guild?.id]?.delete;
    if (canalId) {
        const canal = message.guild.channels.cache.get(canalId);
        if (canal) canal.send(`🗑️ Mensagem deletada de ${message.author.tag}: "${message.content}"`);
    }
});

// Nickname alterado
client.on("guildMemberUpdate", async (oldMember, newMember) => {
    const data = loadLogData();
    const canalId = data[oldMember.guild.id]?.nickname;
    if (canalId && oldMember.nickname !== newMember.nickname) {
        const canal = oldMember.guild.channels.cache.get(canalId);
        if (canal) canal.send(`🔄 ${oldMember.user.tag} alterou o nickname de **${oldMember.nickname || oldMember.user.username}** para **${newMember.nickname || newMember.user.username}**`);
    }
});

// Avatar alterado
client.on("userUpdate", async (oldUser, newUser) => {
    if (oldUser.avatar !== newUser.avatar) {
        client.guilds.cache.forEach(async guild => {
            const member = await guild.members.fetch(newUser.id).catch(() => null);
            if (!member) return;

            const data = loadLogData();
            const canalId = data[guild.id]?.avatar;
            if (canalId) {
                const canal = guild.channels.cache.get(canalId);
                if (canal) canal.send(`🖼️ ${newUser.tag} alterou o avatar!`);
            }
        });
    }
});

// Entrou ou saiu do canal de voz
client.on("voiceStateUpdate", async (oldState, newState) => {
    const data = loadLogData();
    const guildId = newState.guild.id;

    if (!oldState.channel && newState.channel) {
        const canalId = data[guildId]?.voice_enter;
        if (canalId) {
            const canal = newState.guild.channels.cache.get(canalId);
            if (canal) canal.send(`🎙️ ${newState.member.user.tag} entrou no canal de voz ${newState.channel.name}`);
        }
    }

    if (oldState.channel && !newState.channel) {
        const canalId = data[guildId]?.voice_leave;
        if (canalId) {
            const canal = oldState.guild.channels.cache.get(canalId);
            if (canal) canal.send(`📴 ${oldState.member.user.tag} saiu do canal de voz ${oldState.channel.name}`);
        }
    }
});
