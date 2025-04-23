const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { updateConfig } = require('../events/configManager');

module.exports = {
    name: 'configpedido',
    description: '[ADM] Configure o sistema de pedidos',
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para usar esse comando.', ephemeral: true });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('config_pedido_menu')
            .setPlaceholder('O que você deseja configurar?')
            .addOptions([
                { label: 'Chave PIX', value: 'chave_pix', emoji: '🔑' },
                { label: 'Canal de Logs', value: 'canal_logs', emoji: '📢' },
                { label: 'Canal de Confirmação', value: 'canal_confirmacao', emoji: '📥' },
                { label: 'Imagem da Embed PEDIDO GERADO', value: 'imagem_embed', emoji: '🖼️' }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ content: '⚙️ Selecione uma opção de configuração:', components: [row], ephemeral: true });
    }
};