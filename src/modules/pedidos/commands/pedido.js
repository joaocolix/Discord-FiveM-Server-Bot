const Discord = require('discord.js');
const { PIX } = require('gpix/dist');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const { getConfig, updateConfig } = require('../events/configManager');

module.exports = {
    name: 'pedido',
    description: '[ADM] Gere ou configure pedidos PIX',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'ação',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'O que deseja fazer?',
            required: true,
            choices: [
                { name: 'Gerar', value: 'gerar' },
                { name: 'Configurar', value: 'configurar' }
            ]
        },
        {
            name: 'descrição',
            description: 'Descrição do pedido',
            type: Discord.ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'valor',
            description: 'Valor do pedido (apenas número)',
            type: Discord.ApplicationCommandOptionType.Number,
            required: false
        },
        {
            name: 'pagador',
            description: 'Usuário que irá pagar',
            type: Discord.ApplicationCommandOptionType.User,
            required: false
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Você não tem permissão para isso.', flags: 1 << 6 });
        }

        const acao = interaction.options.getString('ação');
        const config = getConfig();

        if (acao === 'configurar') {
            const menu = new Discord.StringSelectMenuBuilder()
                .setCustomId('config_pedido_menu')
                .setPlaceholder('Escolha o que deseja configurar')
                .addOptions([
                    { label: 'Chave PIX', value: 'chave_pix' },
                    { label: 'Canal de Logs', value: 'canais_logs' },
                    { label: 'Canal de Confirmação', value: 'canal_confirmacao' },
                    { label: 'Imagem da Embed PEDIDO GERADO', value: 'imagem_embed' },
                    { label: 'Relatório de Vendas', value: 'relatorio_vendas' }
                ]);

            const row = new Discord.ActionRowBuilder().addComponents(menu);
            return await interaction.reply({ content: 'Escolha uma configuração abaixo:', components: [row], flags: 1 << 6 });
        }

        if (acao === 'gerar') {
            const desc = interaction.options.getString('descrição');
            const valor = interaction.options.getNumber('valor');
            const pagador = interaction.options.getUser('pagador');

            if (!desc || !valor || !pagador) {
                return interaction.reply({ content: 'Para gerar um pedido, você deve fornecer descrição, valor e pagador.', flags: 1 << 6 });
            }

            const imagem = config.imagem_embed;
            const canalLogsId = config.canais_logs;
            const pedidoId = Date.now().toString();

            const embed = new Discord.EmbedBuilder()
                .setColor('#d6dae7')
                .setImage(imagem)
                .setFooter({ text: `Horário (UTC-3): ${moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')}` })
                .setDescription(
                    `## PEDIDO GERADO\n**DETALHES:**\n- **Cliente:** ${pagador}\n- **Produto:** \`${desc}\`\n- **Valor:** \`R$ ${valor},00\`\n\n**Destino:** Levi Gurgel | NuBank\n\nSelecione seu método de pagamento abaixo!`
                );

            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder().setCustomId(`gerar_qrcode_${pedidoId}`).setLabel('Gerar QR Code').setStyle(Discord.ButtonStyle.Primary),
                new Discord.ButtonBuilder().setCustomId(`copy_pix_${pedidoId}`).setLabel('Chave PIX').setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder().setCustomId(`confirmar_pagamento_${pedidoId}`).setLabel('Confirmar Pagamento').setStyle(Discord.ButtonStyle.Secondary)
            );

            const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

            if (!client.payments) client.payments = {};
            client.payments[pedidoId] = {
                chave: config.chave_pix,
                nomeRecebedor: client.user.username,
                cidade: "Brasil",
                descricao: desc,
                valor,
                pedidoId,
                criadoPor: interaction.user.id,
                pagadorId: pagador.id,
                pedidoMsgId: msg.id,
                pedidoChannelId: msg.channel.id
            };

            const logChannel = await client.channels.fetch(canalLogsId).catch(() => null);
            if (logChannel && logChannel.isTextBased()) {
                const logEmbed = new Discord.EmbedBuilder()
                    .setColor("#ffcc01")
                    .setTitle("Novo Pedido Gerado")
                    .addFields(
                        { name: "Cliente", value: `${pagador}`, inline: true },
                        { name: "Produto", value: `\`${desc}\``, inline: true },
                        { name: "Valor", value: `R$ ${valor},00`, inline: true },
                        { name: "ID do Pedido", value: `\`${pedidoId}\`` },
                        { name: "Gerado por", value: `${interaction.user}` },
                    )
                    .setTimestamp();

                await logChannel.send({ embeds: [logEmbed] });
            }

            return interaction.reply({ content: 'Pedido gerado com sucesso!', flags: 1 << 6 });
        }
    }
};
