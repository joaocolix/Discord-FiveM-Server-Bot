const Discord = require('discord.js')
const client = require('../../../index')
const fs = require("fs");
const path = require("path");

const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");
const res = require('../../../utils/resTypes');

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
    if (interaction.customId !== "antilink_add_channel") return;

    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;

    const selectedChannel = interaction.values[0];

    if (!data[guildId]) {
        data[guildId] = { channels: [], allowedRoles: [] };
    }

    if (!data[guildId].channels.includes(selectedChannel)) {
        data[guildId].channels.push(selectedChannel);
        saveAntiLinkData(data);

        await interaction.update(
            res.success(`O canal <#${selectedChannel}> foi adicionado ao sistema anti-link.`, {
                ephemeral: true,
                content: ``,
                components: []
            })
        );
    } else {
        await interaction.update(
            res.warning(`O canal <#${selectedChannel}> já está registrado.`, {
                ephemeral: true,
                content: ``,
                components: []
            })
        );
    }
});