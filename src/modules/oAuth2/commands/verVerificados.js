const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const tokenFilePath = path.join(__dirname, "../../../database/json/token.json");

module.exports = {
    name: "auth-verificados",
    description: "[INFO] Exibe o número de usuários verificados.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                ephemeral: true,
            });
        }

        let verifiedCount = 0;

        try {
            if (fs.existsSync(tokenFilePath)) {
                const data = fs.readFileSync(tokenFilePath);
                const tokens = JSON.parse(data);
                verifiedCount = Object.keys(tokens).length;
            }
        } catch (error) {
            console.error("Erro ao ler os tokens:", error);
            return interaction.reply({ content: "Erro ao obter o número de usuários verificados.", ephemeral: true });
        }

        await interaction.reply({ content: `Atualmente, **${verifiedCount}** usuários já se verificaram.`, ephemeral: false });
    }
};
