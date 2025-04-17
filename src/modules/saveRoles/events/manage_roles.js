const fs = require("fs");
const path = require("path");
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

module.exports = {
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        if (!interaction.customId.startsWith("manage_roles:")) return;

        const userId = interaction.customId.split(":")[1];
        const selectedRoles = interaction.values;

        const storedRoles = loadStoredRoles();

        if (!storedRoles[userId]) {
            return interaction.update({
                content: "Não foi possível encontrar os dados deste usuário.",
                components: [],
            });
        }

        storedRoles[userId].roles = selectedRoles;
        saveStoredRoles(storedRoles);

        await interaction.update({
            content: `Cargos atualizados para o usuário <@${userId}>.`,
            components: [],
        });
    },
};