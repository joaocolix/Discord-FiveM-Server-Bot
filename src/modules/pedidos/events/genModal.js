const Discord = require('discord.js');
const client = require('../../../index');
const { getConfig } = require('./configManager');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('modal_pagamento_')) {
        const pedidoId = interaction.customId.split('_')[2];
        const pedidoData = client.payments?.[pedidoId];

        if (!pedidoData) {
            return await interaction.reply({ content: 'Não foi possível encontrar esse pedido.', flags: 1 << 6 });
        }

        const nome = interaction.fields.getTextInputValue('nome');
        const cpf = interaction.fields.getTextInputValue('cpf');
        const instituicao = interaction.fields.getTextInputValue('instituicao');

        const config = getConfig();
        const logChannel = await client.channels.fetch(config.canais_logs).catch(() => null);

        if (logChannel && logChannel.isTextBased()) {
            const logEmbed = new Discord.EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('Confirmação de Pagamento Recebida')
                .addFields(
                    { name: "Pedido", value: `\`${pedidoId}\``, inline: true },
                    { name: "Nome", value: nome, inline: true },
                    { name: "CPF", value: cpf, inline: true },
                    { name: "Instituição", value: instituicao, inline: true },
                    { name: "Valor", value: `R$ ${pedidoData.valor},00`, inline: true },
                    { name: "Produto", value: pedidoData.descricao },
                    { name: "Cliente", value: `<@${pedidoData.pagadorId || 'ID indisponível'}>` }
                )
                .setFooter({ text: `Clique em Confirmar ou Cancelar abaixo.` });

            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId(`confirmar_final_${pedidoId}`)
                        .setLabel('Confirmar')
                        .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                        .setCustomId(`cancelar_final_${pedidoId}`)
                        .setLabel('Cancelar')
                        .setStyle(Discord.ButtonStyle.Danger)
                );

            const logMsg = await logChannel.send({ embeds: [logEmbed], components: [row] });

            await interaction.reply({ content: 'Confirmação enviada com sucesso! Aguarde aprovação.', flags: 1 << 6 });

            client.payments[pedidoId].logMsgId = logMsg.id;
        } else {
            await interaction.reply({ content: 'Canal de logs não configurado ou não acessível.', flags: 1 << 6  });
        }
    }
});