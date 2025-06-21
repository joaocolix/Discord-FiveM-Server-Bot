const Discord = require('discord.js');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');  
const client = require('../../../index');

const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const { updateConfig } = require('./configManager');
const { getConfig } = require('./configManager');
const res = require('../../../utils/resTypes');
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
                ...res.success('Selecione os canais para receber logs:', { ephemeral: true }),
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
                ...res.success('Selecione o canal onde as confirmações serão enviadas:', { ephemeral: true }),
                components: [row],
                flags: 1 << 6
            });
        }

        if (selected === 'relatorio_vendas') {
            const modal = new ModalBuilder()
                .setCustomId('modal_relatorio_vendas')
                .setTitle('Relatório de Vendas')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('dias_relatorio')
                            .setLabel('Quantos dias considerar?')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                            .setPlaceholder('Ex: 7')
                    )
                );

            return await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'config_chave_pix') {
        const nova = interaction.fields.getTextInputValue('nova_chave_pix');
        const chaveValida = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/i.test(nova);

        if (!chaveValida) {
            return await interaction.update({
                ...res.error('Chave PIX inválida. Use um e-mail válido, tipo `pix@dominio.com`.', { ephemeral: true }),
                components: [],
                flags: 1 << 6
            });
        }

        updateConfig('chave_pix', nova);
        return await interaction.update({
            ...res.success('Chave PIX atualizada com sucesso!', { ephemeral: true }),
            components: [],
            flags: 1 << 6
        });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'config_imagem_embed') {
        const nova = interaction.fields.getTextInputValue('nova_imagem_embed');
        const isURLValida = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(nova);

        if (!isURLValida) {
            return await interaction.update({
                ...res.error('URL inválida. Ela precisa terminar com `.jpg`, `.png`, `.gif`, etc.', { ephemeral: true }),
                components: [],
                flags: 1 << 6
            });
        }

        updateConfig('imagem_embed', nova);
        return await interaction.update({
            ...res.success('Imagem da embed atualizada com sucesso!', { ephemeral: true }),
            components: [],
            flags: 1 << 6
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionar_canais_logs') {
        const canais = interaction.values;
        updateConfig('canais_logs', canais);

        return await interaction.update({
            ...res.success(`Canais de log atualizados: ${canais.map(id => `<#${id}>`).join(', ')}`, { ephemeral: true }),
            components: []
        });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId === 'selecionar_canal_confirmacao') {
        const canal = interaction.values[0];
        updateConfig('canal_confirmacao', canal);

        return await interaction.update({
            ...res.success(`Canal de confirmação atualizado para: <#${canal}>`, { ephemeral: true }),
            components: []
        });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_relatorio_vendas') {
        const diasInput = interaction.fields.getTextInputValue('dias_relatorio');
        const dias = parseInt(diasInput);

        if (isNaN(dias) || dias <= 0) {
            return await interaction.update({
                ...res.error('Informe um número válido de dias.', { ephemeral: true }),
                components: [],
                flags: 1 << 6
            });
        }

        const vendasPath = path.resolve(__dirname, '../data/vendas.json');

        if (!fs.existsSync(vendasPath)) {
            return await interaction.update({
                ...res.error('Nenhuma venda registrada ainda.', { ephemeral: true }),
                components: [],
                flags: 1 << 6
            });
        }

        const vendas = JSON.parse(fs.readFileSync(vendasPath));
        const vendasFiltradas = vendas.filter(v => {
            const dataVenda = moment(v.dataConfirmacao);
            return dataVenda.isAfter(moment().subtract(dias, 'days'));
        });

        if (vendasFiltradas.length === 0) {
            return await interaction.update({
                ...res.error(`Nenhuma venda registrada nos últimos ${dias} dias.`, { ephemeral: true }),
                components: [],
                flags: 1 << 6
            });
        }

        const vendasPorDia = {};
        for (const venda of vendasFiltradas) {
            const dia = moment(venda.dataConfirmacao).format('DD/MM');
            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + venda.valor;
        }

        const labels = Object.keys(vendasPorDia);
        const valores = Object.values(vendasPorDia);
        const total = valores.reduce((acc, val) => acc + val, 0);

        const width = 800;
        const height = 600;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);

        const maxValor = Math.max(...valores);
        const barWidth = 50;
        const gap = 30;
        const baseY = height - 100;

        labels.forEach((label, i) => {
            const barHeight = (valores[i] / maxValor) * 300;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(60 + i * (barWidth + gap), baseY - barHeight, barWidth, barHeight);

            ctx.fillStyle = '#000';
            ctx.font = '16px sans-serif';
            ctx.fillText(`R$${valores[i]}`, 60 + i * (barWidth + gap), baseY - barHeight - 10);
            ctx.fillText(label, 60 + i * (barWidth + gap), baseY + 20);
        });

        const buffer = canvas.toBuffer();

        const embed = new Discord.EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('Relatório de Vendas')
            .setDescription(`**Total de vendas nos últimos ${dias} dias:** R$ ${total.toFixed(2)}`)
            .setImage('attachment://grafico.png')
            .setFooter({ text: `Relatório gerado em ${moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')}` });

        return await interaction.update({
            embeds: [embed],
            components: [],
            content: ``,
            files: [{ name: 'grafico.png', attachment: buffer }],
            flags: 1 << 6
        });
    }
});