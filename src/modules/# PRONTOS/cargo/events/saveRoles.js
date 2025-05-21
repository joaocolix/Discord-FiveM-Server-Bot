const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const res = require('../../../utils/resTypes');

const rolesFilePath = path.join(__dirname, '../data/storedRoles.json');

function loadStoredRoles() {
    if (!fs.existsSync(rolesFilePath)) {
        fs.writeFileSync(rolesFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(rolesFilePath));
}

function saveStoredRoles(data) {
    fs.writeFileSync(rolesFilePath, JSON.stringify(data, null, 4));
}

client.on('guildMemberRemove', (member) => {
    const allRoles = loadStoredRoles();

    const roleIds = member.roles.cache
        .filter(role => role.id !== member.guild.id)
        .map(role => role.id);

    allRoles[member.id] = { roles: roleIds };

    saveStoredRoles(allRoles);
    console.log(`📥 Cargos de ${member.user.tag} salvos.`);
});

client.on('guildMemberAdd', async (member) => {
    const allRoles = loadStoredRoles();
    const storedData = allRoles[member.id];
    if (!storedData) return;

    const { roles: rolesToRestore = [] } = storedData;
    const addedRoles = [];

    for (const roleId of rolesToRestore) {
        const role = member.guild.roles.cache.get(roleId);

        if (
            role &&
            member.guild.members.me.roles.highest.position > role.position &&
            role.editable
        ) {
            try {
                await member.roles.add(role);
                addedRoles.push(role.name);
            } catch (err) {
                console.warn(` Erro ao adicionar "${role.name}" para ${member.user.tag}:`, err);
            }
        }
    }

    delete allRoles[member.id];
    saveStoredRoles(allRoles);

    try {
        const systemChannel = member.guild.systemChannel;
        if (systemChannel && addedRoles.length > 0) {
            await systemChannel.send(
                res.info(`Cargos restaurados para ${member.user}:\n${addedRoles.map(r => `• ${r}`).join('\n')}`, {
                    allowedMentions: { users: [] }
                })
            );
        } else if (systemChannel) {
            await systemChannel.send(
                res.warning(`Nenhum cargo pôde ser restaurado para ${member.user}.`, {
                    allowedMentions: { users: [] }
                })
            );
        }
    } catch (err) {
        console.error(`❌ Falha ao enviar mensagem no canal do sistema para ${member.user.tag}:`, err);
    }

    console.log(`${addedRoles.length > 0
        ? `Cargos restaurados para ${member.user.tag}: ${addedRoles.join(', ')}`
        : `Nenhum cargo foi restaurado para ${member.user.tag}`}`);
});