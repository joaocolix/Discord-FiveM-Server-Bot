const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "notificacoes",
    description: "Configure notificações do servidor!",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "Você não tem permissão pra isso.",
                ephemeral: true
            });
        }

        const options = [
            { label: "Ativar ao entrar no servidor", value: "entrada" },
            { label: "Ativar ao sair do servidor", value: "saida" },
            { label: "Avisar banimento", value: "ban" },
            { label: "Avisar desbanimento", value: "unban" },
            { label: "Mensagem editada", value: "edit" },
            { label: "Mensagem deletada", value: "delete" },
            { label: "Alteração de nickname", value: "nickname" },
            { label: "Alteração de avatar", value: "avatar" },
            { label: "Entrar em canal de voz", value: "voice_enter" },
            { label: "Sair de canal de voz", value: "voice_leave" }
        ];

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("selecionar_notificacao")
            .setPlaceholder("Escolha o tipo de notificação...")
            .addOptions(options);

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: "Selecione o tipo de notificação para configurar:",
            components: [row],
            ephemeral: true
        });
    }
};
