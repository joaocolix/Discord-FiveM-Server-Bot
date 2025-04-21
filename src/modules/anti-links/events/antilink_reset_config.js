const Discord = require('discord.js')
const client = require('../../../index')
const fs = require("fs");
const path = require("path");

const sendLog = require("./antilink_send_logs");
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
    
        await interaction.reply({
            content: "Tem certeza que deseja **resetar todas as configurações** deste servidor?",
            components: [row],
            flags: 1 << 6
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
    
        await interaction.update({
            content: "✅ Configurações resetadas! Backup criado em `antilink_backups.json`.",
            components: []
        });
    }
    
    if (interaction.customId === "antilink_cancel_reset") {
        await interaction.update({
            content: "❌ Reset cancelado.",
            components: []
        });
    }    
    
});
