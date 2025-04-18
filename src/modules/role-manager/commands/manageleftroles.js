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
    description: "[MODERAÇÃO] Gerencia os cargos de membros, mesmo se saíram do servidor",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuario",
            description: "ID do usuário (presente ou que saiu)",
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

        const member = await interaction.guild.members.fetch(userId).catch(() => null);

        let userRoles = [];

        if (member) {
            userRoles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .map(role => role.id);

            storedRoles[userId] = { roles: userRoles };
            saveStoredRoles(storedRoles);
        } else if (storedRoles[userId]?.roles?.length) {
            userRoles = storedRoles[userId].roles;
        } else {
            return interaction.reply({
                content: "Usuário não encontrado e sem cargos salvos.",
                ephemeral: true,
            });
        }

        const allRoles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id) // Ignora @everyone
        .map(role => ({
            label: role.name,
            value: role.id,
            default: userRoles.includes(role.id)
        }))
        .filter(role => role.label.length <= 100); // Discord limita labels a 100 chars    


        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId(`manage_roles:${userId}`)
            .setPlaceholder("Selecione os cargos para manter ou remover")
            .setMinValues(0)
            .setMaxValues(allRoles.length)
            .addOptions(allRoles);

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: `Gerencie os cargos salvos para <@${userId}>:`,
            components: [row],
            ephemeral: true,
        });
    },
};