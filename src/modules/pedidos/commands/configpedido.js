const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { updateConfig } = require('../events/configManager');

module.exports = {
    name: 'configpedido',
    description: '[ADM] Configure o sistema de pedidos',
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar esse comando.', flags: 1 << 6 });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('config_pedido_menu')
            .setPlaceholder('O que você deseja configurar?')
            .addOptions([
                { label: 'Chave PIX', value: 'chave_pix'},
                { label: 'Canal de Logs', value: 'canais_logs'},
                { label: 'Canal de Confirmação', value: 'canal_confirmacao'},
                { label: 'Imagem da Embed PEDIDO GERADO', value: 'imagem_embed'}
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ content: 'Selecione uma opção de configuração:', components: [row], flags: 1 << 6 });
    }
};