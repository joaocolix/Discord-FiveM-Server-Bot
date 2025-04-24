const Discord = require("discord.js");
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../data/callLogs.json");

function loadLogData() {
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(logFile));
}

function saveLogData(data) {
    fs.writeFileSync(logFile, JSON.stringify(data, null, 4));
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "call_menu") return;

    const selected = interaction.values[0];

    if (selected === "create_channel") {
        const channel = await interaction.guild.channels.create({
            name: `🔊 Sala Temporária`,
            type: Discord.ChannelType.GuildVoice,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    allow: [Discord.PermissionFlagsBits.Connect, Discord.PermissionFlagsBits.ViewChannel],
                }
            ]
        });

        await interaction.reply({
            content: `Canal de voz criado: ${channel}`,
            ephemeral: true
        });

    } else if (selected === "set_logs") {
        const logChannel = interaction.channel;

        const data = loadLogData();
        data[interaction.guild.id] = {
            logChannelId: logChannel.id
        };
        saveLogData(data);

        await interaction.reply({
            content: `Canal de logs definido para: ${logChannel}`,
            ephemeral: true
        });
    }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    const user = newState.member;
    const guild = newState.guild;
    const data = loadLogData();
    const logChannelId = data[guild.id]?.logChannelId;

    if (newState.channel && newState.channel.name === "🔊 Sala Temporária") {
        const parent = newState.channel.parent;

        const newChannel = await guild.channels.create({
            name: `Call de ${user.user.username}`,
            type: Discord.ChannelType.GuildVoice,
            parent: parent || null,
            permissionOverwrites: [
                {
                    id: guild.id,
                    allow: [Discord.PermissionFlagsBits.Connect, Discord.PermissionFlagsBits.ViewChannel],
                }
            ]
        });
        
        await user.voice.setChannel(newChannel);

        if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) logChannel.send(`🔔 ${user.user.tag} entrou em call. Canal criado: ${newChannel}`);
        }

        setTimeout(async () => {
            const channelToCheck = guild.channels.cache.get(newChannel.id);
            if (channelToCheck && channelToCheck.members.size === 0) {
                await channelToCheck.delete().catch(() => {});
            }
        }, 10_000);
    }
});
