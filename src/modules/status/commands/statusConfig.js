const Discord = require('discord.js');

module.exports = {
    name: "statusconfig",
    description: "[ADMIN] Editar valores do server.json ou enviar embed de status.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const options = [
            { label: 'IP', value: 'serverIp' },
            { label: 'Porta', value: 'serverPort' },
            { label: 'Connect', value: 'serverConnect' },
            { label: 'Intervalo de atualização', value: 'updateInterval' },
            { label: 'Editar Botões do Embed', value: 'editButtons' },
            { label: 'Modo Manutenção', value: 'setManutencao' },
            { label: 'Enviar Status', value: 'enviarEmbed' }
        ];

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId('edit_config_field')
            .setPlaceholder('Selecione uma opção')
            .addOptions(options);

        const row = new Discord.ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Selecione uma ação:',
            components: [row],
            ephemeral: true
        });
    }
};