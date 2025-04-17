const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const rolesFilePath = path.join(__dirname, "../data/storedRoles.json");

function loadStoredRoles() {
    if (!fs.existsSync(rolesFilePath)) {
        fs.writeFileSync(rolesFilePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(rolesFilePath));
}

function saveStoredRoles(data) {
    fs.writeFileSync(rolesFilePath, JSON.stringify(data, null, 4));
}

module.exports = {
    name: "gerenciarcargos",
    description: "[MODERAÇÃO] Gerencia os cargos de membros que saíram",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuario",
            description: "ID do usuário que saiu",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: "Você não tem permissão para usar este comando.",
                ephemeral: true,
            });
        }

        const userId = interaction.options.getString("usuario");
        const storedRoles = loadStoredRoles();
        const userData = storedRoles[userId];

        if (!userData || !userData.roles?.length) {
            return interaction.reply({
                content: "Este usuário não possui cargos salvos ou não saiu recentemente.",
                ephemeral: true,
            });
        }

        const memberTag = `<@${userId}>`;

        const roleOptions = userData.roles.map(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            return role ? {
                label: role.name,
                value: role.id,
                default: true
            } : null;
        }).filter(Boolean);

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`manage_roles:${userId}`)
            .setPlaceholder("Selecione os cargos para manter ou remover")
            .setMinValues(0)
            .setMaxValues(roleOptions.length)
            .addOptions(roleOptions);

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: `Gerencie os cargos salvos para ${memberTag}:`,
            components: [row],
            ephemeral: true,
        });
    },
};