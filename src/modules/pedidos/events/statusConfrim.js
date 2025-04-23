const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const client = require('../../../index');
const { getConfig } = require('./configManager');

const vendasPath = path.resolve(__dirname, '../data/vendas.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const config = getConfig();

    const pedidoId = interaction.customId.split('_')[2];
    const pedidoData = client.payments?.[pedidoId];
    if (!pedidoData) return;

    if (interaction.customId.startsWith('confirmar_final_')) {
        const channel = interaction.channel;
        const logMessage = await channel.messages.fetch(pedidoData.logMsgId).catch(() => null);

        if (logMessage) {
            const updatedEmbed = Discord.EmbedBuilder.from(logMessage.embeds[0]);
            updatedEmbed.setColor("#00cc66").setFooter({ text: "Pagamento confirmado." });

            await logMessage.edit({ embeds: [updatedEmbed], components: [] });
        }

        const pedidoChannel = interaction.guild.channels.cache.get(
            config.canal_confirmacao || pedidoData.pedidoChannelId || interaction.channelId
        );

        if (pedidoChannel) {
            let pedidoMsg = null;

            if (pedidoData.pedidoMsgId) {
                pedidoMsg = await pedidoChannel.messages.fetch(pedidoData.pedidoMsgId).catch(() => null);
            } else {
                const messages = await pedidoChannel.messages.fetch({ limit: 50 });
                pedidoMsg = messages.find(msg =>
                    msg.embeds.length && msg.embeds[0].description?.includes(pedidoId)
                );
            }

            if (pedidoMsg) {
                const embed = Discord.EmbedBuilder.from(pedidoMsg.embeds[0]);
                embed.setColor('#00ff00');
                embed.setDescription(`${embed.data.description}\n\n**Status:** Pagamento Confirmado`);

                const disabledComponents = pedidoMsg.components.map(row => {
                    const newRow = Discord.ActionRowBuilder.from(row);
                    newRow.components = row.components.map(button =>
                        Discord.ButtonBuilder.from(button).setDisabled(true)
                    );
                    return newRow;
                });

                await pedidoMsg.edit({ embeds: [embed], components: disabledComponents });
            }
        }

        await interaction.reply({ content: 'Pagamento confirmado com sucesso!', flags: 1 << 6 });

        await salvarVenda({
            id: pedidoId,
            descricao: pedidoData.descricao,
            valor: pedidoData.valor,
            pagadorId: pedidoData.pagadorId,
            criadoPor: pedidoData.criadoPor
        });
    }

    if (interaction.customId.startsWith('cancelar_final_')) {
        const channel = interaction.channel;
        const logMessage = await channel.messages.fetch(pedidoData.logMsgId).catch(() => null);

        if (logMessage) {
            const embed = Discord.EmbedBuilder.from(logMessage.embeds[0]);
            embed.setColor('#ff3333');
            embed.setDescription(`${embed.data.description}\n\n**Status:** Pagamento Cancelado`);

            await logMessage.edit({ embeds: [embed] });
        }

        await interaction.reply({ content: '🚫 Confirmação cancelada.', flags: 1 << 6 });
    }
});

async function salvarVenda(dados) {
    try {
        let vendas = [];
        if (fs.existsSync(vendasPath)) {
            const raw = fs.readFileSync(vendasPath);
            vendas = JSON.parse(raw);
        }

        vendas.push({
            ...dados,
            dataConfirmacao: new Date().toISOString()
        });

        fs.writeFileSync(vendasPath, JSON.stringify(vendas, null, 2));
    } catch (err) {}
}
