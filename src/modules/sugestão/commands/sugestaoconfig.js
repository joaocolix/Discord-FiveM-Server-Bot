const Discord = require('discord.js');

module.exports = {
    name: "sugestaoconfig",
    description: "[ADMIN] Configurar sistema de sugestões.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId('config_sugestao_menu')
            .setPlaceholder('Escolha o que deseja configurar')
            .addOptions([
                { label: 'Editar Prefixo', value: 'editar_prefixo' },
                { label: 'Editar Canais Permitidos', value: 'editar_canais' },
                { label: 'Ativar/Desativar Criação de Tópico', value: 'editar_topico' }
            ]);

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: "Selecione uma configuração para alterar:",
            components: [row],
            flags: 1 << 6
        });
    }
};