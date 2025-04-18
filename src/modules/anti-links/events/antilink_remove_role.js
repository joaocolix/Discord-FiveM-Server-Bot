const Discord = require('discord.js')
const client = require('../../../index')
const fs = require("fs");
const path = require("path");

const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

function saveAntiLinkData(data) {
    fs.writeFileSync(antiLinkPath, JSON.stringify(data, null, 4));
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "antilink_remove_role") return;

    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;
    const selectedRole = interaction.values[0];

    if (!data[guildId]) {
        return interaction.update({ content: "Configuração não encontrada.", components: [] });
    }

    const index = data[guildId].allowedRoles.indexOf(selectedRole);
    if (index > -1) {
        data[guildId].allowedRoles.splice(index, 1);
        saveAntiLinkData(data);

        await interaction.update({
            content: `O cargo <@&${selectedRole}> foi removido da lista de permissões.`,
            components: []
        });
    } else {
        await interaction.update({
            content: `Esse cargo não está na lista.`,
            components: []
        });
    }
});
