const Discord = require('discord.js');
const { PIX } = require('gpix/dist');
const Canvas = require('canvas');
const moment = require('moment-timezone');
const { getConfig } = require('../events/configManager');

module.exports = {
    name: 'gerar-pedido',
    description: '[ADM] Gera um pedido com um valor especificado e permite gerar um QR Code sob demanda.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'descrição',
            description: "Descrição do que será cobrado (pedido).",
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'valor',
            description: 'Valor a ser cobrado pelo PIX.',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "pagador",
            description: "Pagador do pedido",
            type: Discord.ApplicationCommandOptionType.User,
            required: true
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, flags: 1 << 6 });
        }

        const config = getConfig();
        const chave = config.chave_pix;
        const imagem = config.imagem_embed;
        const canalLogsId = config.canais_logs;

        const valor = interaction.options.getNumber('valor');
        const desc = interaction.options.getString('descrição');
        const pagador = interaction.options.getUser('pagador');
        const pedidoId = Date.now().toString();

        const pedidoData = {
            chave,
            nomeRecebedor: client.user.username,
            cidade: "Brasil",
            descricao: desc,
            valor,
            pedidoId,
            criadoPor: interaction.user.id,
            pagadorId: pagador.id
        };

        const embed = new Discord.EmbedBuilder()
            .setColor("#d6dae7")
            .setImage(imagem)
            .setFooter({ text: `Horário (UTC-3): ${moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')}` })
            .setDescription(
                `## PEDIDO GERADO\n**DETALHES:**\n- **Cliente:** ${pagador}\n- **Produto:** \`${desc}\`\n- **Valor:** \`R$ ${valor},00\`\n\n**Destino:** Levi Gurgel | NuBank\n\nSelecione seu método de pagamento abaixo!`
            );

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`gerar_qrcode_${pedidoId}`)
                .setLabel('Gerar QR Code')
                .setStyle(Discord.ButtonStyle.Primary),
            new Discord.ButtonBuilder()
                .setCustomId(`copy_pix`)
                .setLabel('Chave PIX')
                .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
                .setCustomId(`confirmar_pagamento_${pedidoId}`)
                .setLabel('Confirmar Pagamento')
                .setStyle(Discord.ButtonStyle.Secondary)
        );

        const sentMsg = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({ content: `Pedido gerado com sucesso.`, flags: 1 << 6 });

        if (!client.payments) client.payments = {};
        client.payments[pedidoId] = {
            ...pedidoData,
            pedidoMsgId: sentMsg.id,
            pedidoChannelId: sentMsg.channel.id
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
    }
};