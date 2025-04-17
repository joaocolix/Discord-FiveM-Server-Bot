const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');

const rolesFilePath = path.join(__dirname, '../data/storedRoles.json');

function loadStoredRoles() {
    if (!fs.existsSync(rolesFilePath)) {
        fs.writeFileSync(rolesFilePath, JSON.stringify({}));
    }
    const data = fs.readFileSync(rolesFilePath);
    return JSON.parse(data);
}

function saveStoredRoles(data) {
    fs.writeFileSync(rolesFilePath, JSON.stringify(data, null, 4));
}

client.on('guildMemberRemove', (member) => {
    const allRoles = loadStoredRoles();

    const roleIds = member.roles.cache
        .filter(role => role.id !== member.guild.id)
        .map(role => role.id);

    if (!allRoles[member.id]) {
        allRoles[member.id] = {};
    }

    allRoles[member.id].roles = roleIds;

    saveStoredRoles(allRoles);
    console.log(`Cargos de ${member.user.tag} salvos.`);
});

client.on('guildMemberAdd', async (member) => {
    const allRoles = loadStoredRoles();
    const storedData = allRoles[member.id];

    if (storedData) {
        const { roles: rolesToRestore = [], channels: channelsToRestore = [] } = storedData;

        try {
            for (const roleId of rolesToRestore) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }

            for (const channelId of channelsToRestore) {
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.permissionOverwrites.edit(member.id, {
                        ViewChannel: true
                    });
                }
            }

            console.log(`Cargos e canais restaurados para ${member.user.tag}`);
        } catch (error) {
            console.error(`Erro ao restaurar dados para ${member.user.tag}:`, error);
        }

        delete allRoles[member.id];
        saveStoredRoles(allRoles);
    }
});

const { ChannelType, Events } = require('discord.js');

client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    if (newChannel.type !== ChannelType.GuildText) return;

    const storedRoles = loadStoredRoles();
    const guild = newChannel.guild;

    const oldOverwrites = oldChannel.permissionOverwrites.cache;
    const newOverwrites = newChannel.permissionOverwrites.cache;

    newOverwrites.forEach((overwrite, id) => {
        if (guild.roles.cache.has(id)) return;

        const memberId = id;
        const oldPerms = oldOverwrites.get(memberId)?.allow?.has('ViewChannel') || false;
        const newPerms = overwrite.allow.has('ViewChannel');

        if (oldPerms !== newPerms) {
            if (!storedRoles[memberId]) {
                storedRoles[memberId] = { roles: [], channels: [] };
            }

            const channelList = new Set(storedRoles[memberId].channels);

            if (newPerms) {
                channelList.add(newChannel.id);
                console.log(`Acesso direto ao canal ${newChannel.name} adicionado para ${memberId}`);
            } else {
                channelList.delete(newChannel.id);
                console.log(`Acesso direto ao canal ${newChannel.name} removido de ${memberId}`);
            }

            storedRoles[memberId].channels = [...channelList];
            saveStoredRoles(storedRoles);
        }
    });
});
