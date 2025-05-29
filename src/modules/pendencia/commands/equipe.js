const Discord = require('discord.js');

module.exports = {
    name: 'pendencia',
    description: 'Menu de controle de equipes e pendências.',
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('menu_principal')
            .setPlaceholder('Escolha uma opção')
            .addOptions([
                {
                    label: 'Gerar Pendência',
                    description: 'Criar uma nova pendência e notificar uma equipe',
                    value: 'gerar_pendencia'
                },
                {
                    label: 'Equipes',
                    description: 'Gerenciar as equipes disponíveis',
                    value: 'gerenciar_equipes'
                }
            ]);

        const row = new Discord.ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: 'O que você deseja fazer?',
            components: [row],
            ephemeral: true
        });
    }
};