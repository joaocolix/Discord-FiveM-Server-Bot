const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { getAccessToken, addMemberToServer } = require("../api/oauth2");

const tokenFilePath = path.join(__dirname, "../data/token.json");

module.exports = {
    name: "auth-redirecionar",
    description: "[ADMIN] Readiciona todos os usuários verificados em um servidor específico ou no atual.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "servidor_id",
            description: "ID do servidor (opcional, se não informado, será o servidor atual).",
            type: Discord.ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: "usuario_id",
            description: "ID do usuário para readicionar (opcional, se não informado, serão todos).",
            type: Discord.ApplicationCommandOptionType.String,
            required: false
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                ephemeral: true,
            });
        }

        const serverId = interaction.options.getString("servidor_id") || interaction.guild.id;
        const userIdInput = interaction.options.getString("usuario_id");

        if (!fs.existsSync(tokenFilePath)) {
            return interaction.reply({ content: "Nenhum usuário verificado encontrado.", ephemeral: true });
        }

        const data = fs.readFileSync(tokenFilePath);
        const tokens = JSON.parse(data);
        const users = Object.keys(tokens);

        if (users.length === 0) {
            return interaction.reply({ content: "Nenhum usuário verificado encontrado.", ephemeral: true });
        }

        let toProcess = users;

        if (userIdInput) {
            if (!tokens[userIdInput]) {
                return interaction.reply({ content: `O usuário com ID \`${userIdInput}\` não está verificado.`, ephemeral: true });
            }
            toProcess = [userIdInput];
        }

        await interaction.reply({
            content: userIdInput
                ? `Tentando readicionar o usuário com ID \`${userIdInput}\` ao servidor **${serverId}**...`
                : `Tentando adicionar **${users.length}** usuários ao servidor **${serverId}**...`,
            ephemeral: true
        });

        let addedCount = 0;
        let failedCount = 0;

        for (const userId of toProcess) {
            try {
                const accessToken = await getAccessToken(userId);
                if (!accessToken) {
                    failedCount++;
                    continue;
                }

                await addMemberToServer(userId, serverId, accessToken);
                addedCount++;

            } catch (error) {
                console.error(`Erro ao adicionar o usuário ${userId} ao servidor ${serverId}:`, error.response ? error.response.data : error.message);
                failedCount++;
            }
        }

        interaction.followUp({
            content: userIdInput
                ? `Usuário com ID \`${userIdInput}\` ${addedCount ? "foi readicionado com sucesso" : "falhou ao ser readicionado"} ao servidor **${serverId}**.`
                : `**${addedCount}** usuários foram adicionados ao servidor **${serverId}**.\n**${failedCount}** usuários falharam ao ser adicionados.`,
            ephemeral: false
        });
    }
};