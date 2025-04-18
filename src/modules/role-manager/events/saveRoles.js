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

    allRoles[member.id] = {
        roles: roleIds
    };

    saveStoredRoles(allRoles);
    console.log(`Cargos de ${member.user.tag} salvos.`);
});

client.on('guildMemberAdd', async (member) => {
    const allRoles = loadStoredRoles();
    const storedData = allRoles[member.id];

    if (storedData) {
        const { roles: rolesToRestore = [] } = storedData;

        try {
            for (const roleId of rolesToRestore) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }

            console.log(`Cargos restaurados para ${member.user.tag}`);
        } catch (error) {
            console.error(`Erro ao restaurar cargos para ${member.user.tag}:`, error);
        }

        delete allRoles[member.id];
        saveStoredRoles(allRoles);
    }
});
