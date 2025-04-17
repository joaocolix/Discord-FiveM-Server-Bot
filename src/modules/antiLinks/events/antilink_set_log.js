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
    if (!interaction.isChannelSelectMenu()) return;
    if (interaction.customId !== "antilink_set_log") return;

    const selectedChannel = interaction.values[0];
    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;

    if (!data[guildId]) {
        data[guildId] = {
            channels: [],
            allowedRoles: [],
            allowedLinks: [],
            logChannel: null
        };
    }

    data[guildId].logChannel = selectedChannel;
    saveAntiLinkData(data);

    await interaction.update({
        content: `Canal de log definido: <#${selectedChannel}>`,
        components: []
    });
});
