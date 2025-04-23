const Discord = require('discord.js');
const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    StringSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ChannelType
} = require('discord.js');  

const client = require('../../../index');
const { updateConfig } = require('./configManager');
const { getConfig } = require('./configManager');
const config = getConfig();

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'config_pedido_menu') {
        const selected = interaction.values[0];

        if (selected === 'chave_pix') {
            const modal = new ModalBuilder()
                .setCustomId('config_chave_pix')
                .setTitle('Configurar Chave PIX')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('nova_chave_pix')
                            .setLabel('Insira a nova chave PIX')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setValue(config.chave_pix || '')
                    )
                );
            return await interaction.showModal(modal);
        }

        if (selected === 'imagem_embed') {
            const modal = new ModalBuilder()
                .setCustomId('config_imagem_embed')
                .setTitle('Configurar Imagem da Embed')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('nova_imagem_embed')
                            .setLabel('Insira a URL da imagem')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setValue(config.imagem_embed || '')
                    )
                );
            return await interaction.showModal(modal);
        }

        if (selected === 'canais_logs') {
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('selecionar_canais_logs')
                    .setPlaceholder('Selecione os canais de log')
                    .setMinValues(1)
                    .setMaxValues(5) 
                    .addChannelTypes(Discord.ChannelType.GuildText)
            );
        
            return await interaction.update({
                content: 'Selecione os canais para receber logs:',
                components: [row],
                flags: 1 << 6
            });
        }

        if (selected === 'canal_confirmacao') {
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('selecionar_canal_confirmacao')
                    .setPlaceholder('Selecione o canal de confirmação')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addChannelTypes(Discord.ChannelType.GuildText)
            );
        
            return await interaction.update({
                content: 'Selecione o canal onde as confirmações serão enviadas:',
                components: [row],
                flags: 1 << 6
            });
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'config_chave_pix') {
        const nova = interaction.fields.getTextInputValue('nova_chave_pix');
        
        const chaveValida = /^[\w.-]+@[\w.-]+\.\w{2,}$/i.test(nova);
        if (!chaveValida) {
            return await interaction.update({
                content: 'Chave PIX inválida. Use um e-mail válido, tipo `pix@dominio.com`.',
                components: [ ],
                flags: 1 << 6
            });
        }

        updateConfig('chave_pix', nova);
        return await interaction.update({ content: 'Chave PIX atualizada com sucesso!', components: [], flags: 1 << 6  });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'config_imagem_embed') {
        const nova = interaction.fields.getTextInputValue('nova_imagem_embed');

        const isURLValida = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(nova);
        if (!isURLValida) {
            return await interaction.update({
                content: 'URL inválida. Ela precisa terminar com `.jpg`, `.png`, `.gif`, etc.',
                flags: 1 << 6
            });
        }

        updateConfig('imagem_embed', nova);
        return await interaction.update({ content: 'Imagem da embed atualizada com sucesso!',components: [], flags: 1 << 6  });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionar_canais_logs') {
        const canais = interaction.values;
        updateConfig('canais_logs', canais);

        return await interaction.update({
            content: `Canais de log atualizados: ${canais.map(id => `<#${id}>`).join(', ')}`,
            components: []
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionar_canal_confirmacao') {
        const canal = interaction.values[0];
    
        updateConfig('canal_confirmacao', canal);
    
        return await interaction.update({
            content: `Canal de confirmação atualizado para: <#${canal}>`,
            components: []
        });
    }    
}); 