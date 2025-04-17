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
    if (interaction.customId !== "antilink_remove_link") return;

    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;
    const selectedLink = interaction.values[0];

    if (!data[guildId]) {
        return interaction.update({ content: "Configuração não encontrada.", components: [] });
    }

    const index = data[guildId].allowedLinks.indexOf(selectedLink);
    if (index > -1) {
        data[guildId].allowedLinks.splice(index, 1);
        saveAntiLinkData(data);

        await interaction.update({
            content: `O link/domínio **${selectedLink}** foi removido da whitelist.`,
            components: []
        });
    } else {
        await interaction.update({
            content: `Esse link não está na lista.`,
            components: []
        });
    }
});
