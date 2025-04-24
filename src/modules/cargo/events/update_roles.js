const fs = require("fs");
const path = require("path");
const client = require("../../../index");
const rolesFilePath = path.join(__dirname, "../data/storedRoles.json");

function loadStoredRoles() {
    if (!fs.existsSync(rolesFilePath)) {
        fs.writeFileSync(rolesFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(rolesFilePath));
}

function saveStoredRoles(data) {
    fs.writeFileSync(rolesFilePath, JSON.stringify(data, null, 4));
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith("manage_roles:")) return;

    const userId = interaction.customId.split(":")[1];
    const selectedRoles = interaction.values;

    const storedRoles = loadStoredRoles();

    if (!storedRoles[userId]) {
        return interaction.update({
            content: "Não foi possível encontrar os dados deste usuário.",
            components: [],
            flags: 1 << 6,
        });
    }

    storedRoles[userId].roles = selectedRoles;
    saveStoredRoles(storedRoles);

    const guild = interaction.guild;
    const member = await guild.members.fetch(userId).catch(() => null);

    if (member) {
        try {
            const rolesToRemove = member.roles.cache.filter(role =>
                storedRoles[userId].roles.includes(role.id) && !selectedRoles.includes(role.id)
            );

            for (const role of rolesToRemove.values()) {
                await member.roles.remove(role).catch(err => {
                    console.error(`Erro ao remover cargo ${role.name} de ${member.user.tag}:`, err);
                });
            }

            for (const roleId of selectedRoles) {
                const role = guild.roles.cache.get(roleId);
                if (role && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role).catch(err => {
                        console.error(`Erro ao adicionar cargo ${role.name} para ${member.user.tag}:`, err);
                    });
                }
            }

            return interaction.update({
                content: `Cargos atualizados e aplicados para o usuário <@${userId}>.`,
                components: [],
                flags: 1 << 6,
            });

        } catch (error) {
            console.error(`Erro ao aplicar cargos para ${userId}:`, error);
            return interaction.update({
                content: `Cargos salvos, mas houve erro ao aplicar para <@${userId}>.`,
                components: [],
                flags: 1 << 6,
            });
        }
    } else {
        return interaction.update({
            content: `Cargos salvos para <@${userId}> (usuário fora do servidor).`,
            components: [],
            flags: 1 << 6,
        });
    }
});