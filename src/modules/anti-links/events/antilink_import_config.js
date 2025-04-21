const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");
const axios = require("axios");

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

    if (interaction.customId === "antilink_import_config") {
        await interaction.reply({
            content: "Envie agora o arquivo `.json` com as configurações que deseja importar. (Você tem 60 segundos)",
            flags: 1 << 6
        });

        const filter = msg =>
            msg.author.id === interaction.user.id &&
            msg.attachments.size > 0 &&
            msg.attachments.first().name.endsWith(".json");

        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        collector.on("collect", async (msg) => {
            const attachment = msg.attachments.first();

            try {
                const response = await axios.get(attachment.url);
                const json = response.data;

                const guildId = interaction.guild.id;
                const data = loadAntiLinkData();

                if (!json || typeof json !== "object") {
                    return msg.reply({ content: "O arquivo enviado não é um JSON válido.", flags: 1 << 6 });
                }

                data[guildId] = {
                    channels: Array.isArray(json.channels) ? json.channels : [],
                    allowedRoles: Array.isArray(json.allowedRoles) ? json.allowedRoles : [],
                    allowedLinks: Array.isArray(json.allowedLinks) ? json.allowedLinks : [],
                    logChannel: typeof json.logChannel === "string" ? json.logChannel : null,
                    mode: ["default", "silent", "log_only", "warn"].includes(json.mode) ? json.mode : "default"
                };                

                saveAntiLinkData(data);

                await msg.reply({ content: "Configurações importadas com sucesso!", flags: 1 << 6 });

                await sendLog(interaction.guild, {
                    title: "Configurações Importadas",
                    description: `Importadas por ${interaction.user}.`,
                    user: interaction.user,
                    color: "#00ccff"
                });

            } catch (err) {
                console.error("Erro ao importar o JSON:", err);
                await msg.reply({ content: "Ocorreu um erro ao importar o arquivo.", flags: 1 << 6 });
            }
        });

        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    content: "Tempo esgotado. Nenhum arquivo foi enviado.",
                    flags: 1 << 6
                });
            }
        });
    }
});