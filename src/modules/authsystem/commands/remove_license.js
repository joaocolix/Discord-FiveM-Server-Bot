const { ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'remove_license',
    description: 'Remover uma licença existente',
    options: [
        {
            name: 'usuario',
            description: 'ID do usuário',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'script',
            description: 'Script a ser removido',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true
        }
    ],

    run: async (client, interaction) => {
        const userId = interaction.options.getString('usuario');
        const script = interaction.options.getString('script');

        const modal = new ModalBuilder()
            .setCustomId(`modal_remove_license_${userId}_${encodeURIComponent(script)}`)
            .setTitle(`Remover Licença`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('removal_reason')
            .setLabel('Motivo da remoção')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);
    }
};