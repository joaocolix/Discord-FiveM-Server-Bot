const { ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    name: 'add_license',
    description: 'Adicionar uma nova licença',
    options: [
        {
            name: 'usuario',
            description: 'ID do usuário que receberá a licença',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'servidor',
            description: 'Servidor da licença',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],

    run: async (client, interaction) => {
        const userId = interaction.options.getString('usuario');
        const servidor = interaction.options.getString('servidor');

        const modal = new ModalBuilder()
            .setCustomId(`modal_add_license_${userId}_${servidor}`)
            .setTitle(`Nova Licença - ${servidor}`);

        const input1 = new TextInputBuilder()
            .setCustomId('script_name')
            .setLabel('Nome do Script')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const input2 = new TextInputBuilder()
            .setCustomId('license_time')
            .setLabel('Tempo da Licença (ex: 30d)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(input1),
            new ActionRowBuilder().addComponents(input2)
        );

        await interaction.showModal(modal);
    },
};