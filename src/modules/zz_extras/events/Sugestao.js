// const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
// const client = require('../../../index');

// const votos = new Map();

// client.on('messageCreate', async (message) => {
//     if (message.author.bot) return;

//     const sugestaoChannelId = "1362456320606998558";

//     if (message.channel.id !== sugestaoChannelId) return;

//     if (message.content.startsWith('+s ')) {
//         const sugestaoTexto = message.content.slice(3).trim();
//         if (!sugestaoTexto) return message.delete();

//         const embed = new EmbedBuilder()
//             .setColor("#2b2d31")
//             .setDescription(`\`\`\`${sugestaoTexto}\`\`\``)
//             .setFooter({ text: `Utilize +s antes de sua sugestão.` });

//         const row = gerarBotoes(0, 0);

//         const sentMessage = await message.channel.send({
//             content: `**Nova sugestão recebida,** enviada por ${message.author}`,
//             embeds: [embed],
//             components: [row]
//         });
        
//         try {
//             await sentMessage.startThread({
//                 name: `Discussão: Sugestão de ${message.author.username}`,
//                 autoArchiveDuration: 60,
//                 reason: 'Discussão sobre a sugestão enviada'
//             });
//         } catch (err) {
//             console.error('Erro ao criar thread:', err);
//         }
        

//         votos.set(sentMessage.id, { sim: new Set(), nao: new Set(), message: sentMessage });

//         await message.delete();
//     } else {
//         try {
//             await message.delete();
//         } catch (err) {
//             console.error('Erro ao deletar mensagem não permitida:', err);
//         }
//     }
// });

// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.isButton()) return;

//     const votoData = votos.get(interaction.message.id);
//     if (!votoData) {
//         return interaction.reply({
//             content: 'Os votos não estão mais disponíveis para essa sugestão.',
//             ephemeral: true
//         });
//     }

//     const userId = interaction.user.id;

//     if (interaction.customId === 'votar_sim') {
//         votoData.nao.delete(userId);
//         votoData.sim.add(userId);
//         await atualizarBotoes(votoData);
//         return interaction.reply({ content: 'Seu voto foi registrado como **Concorda**.', ephemeral: true });
//     }

//     if (interaction.customId === 'votar_nao') {
//         votoData.sim.delete(userId);
//         votoData.nao.add(userId);
//         await atualizarBotoes(votoData);
//         return interaction.reply({ content: 'Seu voto foi registrado como **Discorda**.', ephemeral: true });
//     }
// });

// function gerarBotoes(sim, nao) {
//     const total = sim + nao;
//     let texto = '0%';
//     let estilo = ButtonStyle.Secondary;

//     if (total > 0) {
//         const simPercent = ((sim / total) * 100).toFixed(0);
//         const naoPercent = ((nao / total) * 100).toFixed(0);

//         if (simPercent > naoPercent) {
//             estilo = ButtonStyle.Success;
//             texto = `${simPercent}%`;
//         } else if (naoPercent > simPercent) {
//             estilo = ButtonStyle.Danger;
//             texto = `${naoPercent}%`;
//         } else {
//             estilo = ButtonStyle.Secondary;
//             texto = `${simPercent}%`;
//         }
//     }

//     return new ActionRowBuilder().addComponents(
//         new ButtonBuilder()
//             .setCustomId('votar_sim')
//             .setLabel('✅')
//             .setStyle(ButtonStyle.Success),

//         new ButtonBuilder()
//             .setCustomId('votar_nao')
//             .setLabel('❌')
//             .setStyle(ButtonStyle.Danger),

//         new ButtonBuilder()
//              .setCustomId('porcentagem_display')
//             .setLabel(texto)
//             .setStyle(estilo)
//             .setDisabled(true)
//     );
// }

// async function atualizarBotoes(votoData) {
//     const sim = votoData.sim.size;
//     const nao = votoData.nao.size;

//     const newRow = gerarBotoes(sim, nao);
//     await votoData.message.edit({ components: [newRow] });
// }