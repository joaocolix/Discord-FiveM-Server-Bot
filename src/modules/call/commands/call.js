const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../data/callLogs.json");

function loadLogData() {
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(logFile));
}

function saveLogData(data) {
    fs.writeFileSync(logFile, JSON.stringify(data, null, 4));
}

module.exports = {
    name: "call",
    description: "[SISTEMA] Gerencia sistema de calls temporárias",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId("call_menu")
            .setPlaceholder("Escolha uma opção")
            .addOptions([
                { label: "Criar canal", value: "create_channel" },
                { label: "Definir canal de logs", value: "set_logs" }
            ]);

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: "Selecione uma opção para continuar:",
            components: [row],
            ephemeral: true
        });
    }
};