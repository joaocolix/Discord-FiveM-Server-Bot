const Discord = require('discord.js');
const client = require('../../../index');
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
    if (!interaction.isRoleSelectMenu()) return;
    if (interaction.customId !== "antilink_allow_role") return;

    const data = loadAntiLinkData();
    const guildId = interaction.guild.id;

    const selectedRole = interaction.values[0];

    if (!data[guildId]) {
        data[guildId] = { channels: [], allowedRoles: [] };
    }

    if (!data[guildId].allowedRoles.includes(selectedRole)) {
        data[guildId].allowedRoles.push(selectedRole);
        saveAntiLinkData(data);

        await interaction.update(
            res.success(`O cargo <@&${selectedRole}> agora pode enviar links.`, {
                ephemeral: true,
                content: ``,
                components: []
            })
        );
    } else {
        await interaction.update(
            res.warning(`O cargo <@&${selectedRole}> já está autorizado.`, {
                ephemeral: true,
                content: ``,
                components: []
            })
        );
    }
});