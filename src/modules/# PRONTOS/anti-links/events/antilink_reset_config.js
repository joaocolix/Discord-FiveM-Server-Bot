const Discord = require('discord.js')
const client = require('../../../index')
const fs = require("fs");
const path = require("path");

const sendLog = require("./antilink_send_logs");
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
    if (!interaction.isButton()) return;

    if (interaction.customId === "antilink_reset_config") {
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("antilink_confirm_reset")
                .setLabel("Confirmar reset")
                .setStyle(Discord.ButtonStyle.Danger),

            new Discord.ButtonBuilder()
                .setCustomId("antilink_cancel_reset")
                .setLabel("Cancelar")
                .setStyle(Discord.ButtonStyle.Secondary)
        );

        await interaction.update({
            content: "Tem certeza que deseja **resetar todas as configurações** deste servidor?",
            components: [row],
            ephemeral: true
        });
    }

    if (interaction.customId === "antilink_confirm_reset") {
        const data = loadAntiLinkData();
        const guildId = interaction.guild.id;

        const backupPath = path.join(__dirname, "../data/antilink_backups.json");
        let backups = {};

        if (fs.existsSync(backupPath)) {
            backups = JSON.parse(fs.readFileSync(backupPath));
        }

        backups[guildId] = {
            ...data[guildId],
            backupDate: new Date().toISOString()
        };

        fs.writeFileSync(backupPath, JSON.stringify(backups, null, 4));

        delete data[guildId];
        saveAntiLinkData(data);

        await interaction.update(
            res.success("Configurações resetadas! Backup criado em `antilink_backups.json`.", {
                components: [],
                content: "",
                ephemeral: true
            })
        );
    }

    if (interaction.customId === "antilink_cancel_reset") {
        await interaction.update(
            res.info("Reset cancelado.", {
                components: [],
                content: "",
                ephemeral: true
            })
        );
    }
});