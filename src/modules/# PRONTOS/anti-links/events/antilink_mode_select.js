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

    if (interaction.customId === "antilink_mode_select") {
        const selected = interaction.values[0];
        const data = loadAntiLinkData();
        const guildId = interaction.guild.id;

        if (!data[guildId]) data[guildId] = {};
        data[guildId].mode = selected;
        saveAntiLinkData(data);

        const modeLabel = {
            default: "Padrão (deletar e avisar)",
            silent: "Silencioso (só deletar)",
            log_only: "Apenas log",
            warn: "Advertência (sem deletar)"
        };

        await interaction.update(
            res.success(`Modo de ação definido para: **${modeLabel[selected]}**`, {
                components: [],
                content: ``,
                ephemeral: true
            })
        );
    }
});