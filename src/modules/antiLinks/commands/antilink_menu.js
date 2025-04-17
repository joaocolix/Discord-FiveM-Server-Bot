const Discord = require("discord.js");
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

module.exports = {
    name: "antilink",
    description: "[MODERAÇÃO] Gerencia o sistema anti-link",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({
                content: "Você não tem permissão para usar este comando.",
                ephemeral: true
            });
        }

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId("antilink_menu")
            .setPlaceholder("Selecione uma opção")
            .addOptions([
                { label: "Adicionar canal", value: "add_channel" },
                { label: "Remover canal", value: "remove_channel"},
                { label: "Permitir cargo", value: "allow_role" },
                { label: "Remover cargo", value: "remove_role" },
                { label: "Permitir link", value: "add_link" },
                { label: "Remover link", value: "remove_link" },
                { label: "Definir canal de log", value: "set_log"},
                { label: "Definir modo de ação", value: "set_mode" },
                { label: "Configurações", value: "list_config" }
            ]);

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: "Selecione uma ação para gerenciar o sistema anti-link:",
            components: [row],
            ephemeral: true
        });
    }
};
