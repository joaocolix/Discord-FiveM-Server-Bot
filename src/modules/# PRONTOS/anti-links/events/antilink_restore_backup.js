const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const res = require('../../../utils/resTypes');

const sendLog = require("./antilink_send_logs");
const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "antilink_restore_backup") {
        const guildId = interaction.guild.id;

        const backupPath = path.join(__dirname, "../data/antilink_backups.json");
        const configPath = path.join(__dirname, "../data/antiLinkChannels.json");

        if (!fs.existsSync(backupPath)) {
            return interaction.update(
                res.error("Nenhum backup encontrado.", {
                    ephemeral: true
                })
            );
        }

        const backups = JSON.parse(fs.readFileSync(backupPath));
        const backupData = backups[guildId];

        if (!backupData) {
            return interaction.update(
                res.warning("Nenhum backup salvo para este servidor.", {
                    ephemeral: true
                })
            );
        }

        const configData = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {};
        configData[guildId] = {
            channels: backupData.channels || [],
            allowedRoles: backupData.allowedRoles || [],
            allowedLinks: backupData.allowedLinks || [],
            logChannel: backupData.logChannel || null,
            mode: backupData.mode || "default"
        };

        fs.writeFileSync(configPath, JSON.stringify(configData, null, 4));

        const dataFormatada = new Date(backupData.backupDate).toLocaleString("pt-BR");

        await interaction.update(
            res.success(`Backup restaurado com sucesso!`, {
                ephemeral: true,
                components: [],
            })
        );

        await sendLog(interaction.guild, {
            title: "Backup Restaurado",
            description: `O backup foi restaurado por ${interaction.user}.\n**Data do backup:** \`${dataFormatada}\``,
            user: interaction.user,
            color: "#00cc99"
        });
    }
});