const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const res = require('../../../utils/resTypes');
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
    if (interaction.customId !== "antilink_remove_channel") return;

    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;

    const selectedChannel = interaction.values[0];

    const index = data[guildId]?.channels?.indexOf(selectedChannel);
    if (index > -1) {
        data[guildId].channels.splice(index, 1);
        saveAntiLinkData(data);

        await interaction.update(
            res.success(`O canal <#${selectedChannel}> foi removido do sistema anti-link.`, {
                components: [],
                content: ``,
                ephemeral: true
            })
        );
    } else {
        await interaction.update(
            res.warning(`O canal <#${selectedChannel}> não está registrado.`, {
                components: [],
                content: ``,
                ephemeral: true
            })
        );
    }
});