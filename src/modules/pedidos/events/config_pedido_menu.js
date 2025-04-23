const Discord = require('discord.js');
const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType,
    ComponentType
} = require('discord.js');  
  
const client = require('../../../index');
const { updateConfig } = require('./configManager');
const { getConfig } = require('./configManager');
const config = getConfig();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'config_pedido_menu') {
        const selected = interaction.values[0];

        if (selected === 'chave_pix') {
            const modal = new ModalBuilder()
                .setCustomId('config_chave_pix')
                .setTitle('🔑 Configurar Chave PIX')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('nova_chave_pix')
                            .setLabel('Insira a nova chave PIX')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setValue(config.chave_pix)
                    )
                );
            return await interaction.showModal(modal);
        }

        if (selected === 'imagem_embed') {
            const modal = new ModalBuilder()
                .setCustomId('config_imagem_embed')
                .setTitle('🖼️ Configurar Imagem da Embed')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('nova_imagem_embed')
                            .setLabel('Insira a URL da imagem')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );
            return await interaction.showModal(modal);
        }

        if (selected === 'canal_logs') {
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('selecionar_canais_logs')
                    .setPlaceholder('Selecione os canais de log')
                    .setMinValues(1)
                    .setMaxValues(5) // ou mais, se quiser aceitar vários
                    .addChannelTypes(Discord.ChannelType.GuildText) // só canais de texto
            );
        
            return await interaction.reply({
                content: '📥 Selecione os canais para receber logs:',
                components: [row],
                ephemeral: true
            });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'config_chave_pix') {
            const nova = interaction.fields.getTextInputValue('nova_chave_pix');
            updateConfig('chave_pix', nova);
            return await interaction.reply({ content: '🔑 Chave PIX atualizada com sucesso!', ephemeral: true });
        }

        if (interaction.customId === 'config_imagem_embed') {
            const nova = interaction.fields.getTextInputValue('nova_imagem_embed');
            updateConfig('imagem_embed', nova);
            return await interaction.reply({ content: '🖼️ Imagem da embed atualizada com sucesso!', ephemeral: true });
        }
    }

    if (interaction.isChannelSelectMenu()) {
        if (interaction.customId === 'selecionar_canais_logs') {
            const canais = interaction.values;
    
            updateConfig('canais_logs', canais);
    
            await interaction.update({
                content: `✅ Canais de log atualizados: ${canais.map(id => `<#${id}>`).join(', ')}`,
                components: []
            });
        }
    }
    
});