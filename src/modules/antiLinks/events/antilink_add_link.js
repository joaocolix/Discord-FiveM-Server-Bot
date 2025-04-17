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
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== "antilink_add_link_modal") return;

    const guildId = interaction.guild.id;
    const data = loadAntiLinkData();

    if (!data[guildId]) {
        data[guildId] = { channels: [], allowedRoles: [], allowedLinks: [] };
    }

    if (!Array.isArray(data[guildId].allowedLinks)) {
        data[guildId].allowedLinks = [];
    }

    const link = interaction.fields.getTextInputValue("link_input").toLowerCase().trim();

    if (!data[guildId].allowedLinks.includes(link)) {
        data[guildId].allowedLinks.push(link);
        saveAntiLinkData(data);

        await interaction.reply({
            content: `Link/domínio **${link}** adicionado à whitelist.`,
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: `Esse link já está permitido.`,
            ephemeral: true
        });
    }
});