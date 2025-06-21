const { PIX } = require('gpix/dist');
const Canvas = require('canvas');
const moment = require('moment-timezone');
const Discord = require('discord.js');
const client = require('../../../index');
const { getConfig } = require('./configManager');
const res = require('../../../utils/resTypes');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const config = getConfig();

if (interaction.customId.startsWith('copy_pix_')) {
    const pedidoId = interaction.customId.split('_')[2];
    const pedidoData = client.payments?.[pedidoId];

    if (!pedidoData) {
            return await interaction.reply(
                res.error(`Não foi possível encontrar esse pedido.`, {
                    ephemeral: true
                })
            );
    }

    const pix = PIX.static()
        .setReceiverName(pedidoData.nomeRecebedor)
        .setReceiverCity(pedidoData.cidade)
        .setKey(pedidoData.chave)
        .setDescription(pedidoData.descricao)
        .setAmount(pedidoData.valor);

    const copiaECola = pix.getBRCode();

    return await interaction.reply({ content: `${copiaECola}`, flags: 1 << 6 });
}

    if (interaction.customId.startsWith('gerar_qrcode_')) {
        const pedidoId = interaction.customId.split('_')[2];
        const pedidoData = client.payments?.[pedidoId];

        if (!pedidoData) {
            return await interaction.reply(
                res.error(`Não foi possível encontrar esse pedido.`, {
                    ephemeral: true
                })
            );
        }

        const pix = PIX.static()
            .setReceiverName(pedidoData.nomeRecebedor)
            .setReceiverCity(pedidoData.cidade)
            .setKey(pedidoData.chave)
            .setDescription(pedidoData.descricao)
            .setAmount(pedidoData.valor);

        const canvas = Canvas.createCanvas(1200, 1200);
        const context = canvas.getContext('2d');
        const qrCodeImage = await Canvas.loadImage(await pix.getQRCode());

        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(qrCodeImage, 0, 0, canvas.width, canvas.height);

        const embed = new Discord.EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('QR Code PIX Gerado')
            .setDescription(`Use o QR Code abaixo para realizar o pagamento do pedido **${pedidoId}**\n\n**Valor:** R$ ${pedidoData.valor}`)
            .setImage('attachment://qrcode.png');

        await interaction.reply({
            embeds: [embed],
            files: [{
                name: 'qrcode.png',
                attachment: canvas.toBuffer()
            }],
            flags: 1 << 6
        });
    }

    if (interaction.customId.startsWith('confirmar_pagamento_')) {
        const pedidoId = interaction.customId.split('_')[2];

        const modal = new Discord.ModalBuilder()
            .setCustomId(`modal_pagamento_${pedidoId}`)
            .setTitle('Confirmação de Pagamento');

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('nome')
                    .setLabel("Nome Completo")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
            ),
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('cpf')
                    .setLabel("CPF")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
            ),
            new Discord.ActionRowBuilder().addComponents(
                new Discord.TextInputBuilder()
                    .setCustomId('instituicao')
                    .setLabel("Instituição Bancária")
                    .setStyle(Discord.TextInputStyle.Short)
                    .setRequired(true)
            )
        );

        await interaction.showModal(modal);

        const message = await interaction.message.fetch().catch(() => null);
        if (message) {
            const components = message.components.map(row => {
                const newRow = Discord.ActionRowBuilder.from(row);
                newRow.components = row.components.map(button => {
                    if (button.customId === interaction.customId) {
                        return Discord.ButtonBuilder.from(button)
                            .setLabel('Aguardando Confirmação')
                            .setDisabled(true);
                    }
                    return button;
                });
                return newRow;
            });

            await message.edit({ components });
        }
    }
});