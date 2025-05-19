// const Discord = require('discord.js');
// const Canvas = require('canvas');
// const fs = require('fs');
// const path = require('path');
// const client = require('../../../index');

// const configPath = path.resolve(__dirname, '../data/captchaConfig.json');

// function getCaptchaConfig() {
//     if (!fs.existsSync(configPath)) return {};
//     return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
// }

// function updateCaptchaConfig(newData) {
//     const current = getCaptchaConfig();
//     const updated = { ...current, ...newData };
//     fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
// }

// function resetCaptchaConfig() {
//     fs.writeFileSync(configPath, '{}');
// }

// async function generateCaptcha(text) {
//     const canvas = Canvas.createCanvas(400, 150);
//     const ctx = canvas.getContext('2d');

//     ctx.fillStyle = '#f0f0f0';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     for (let i = 0; i < 5; i++) {
//         ctx.strokeStyle = '#ccc';
//         ctx.beginPath();
//         ctx.moveTo(Math.random() * 400, Math.random() * 150);
//         ctx.lineTo(Math.random() * 400, Math.random() * 150);
//         ctx.stroke();
//     }

//     ctx.font = 'bold 48px Sans';
//     ctx.fillStyle = '#000';
//     ctx.textAlign = 'center';
//     ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 16);

//     return canvas.toBuffer();
// }

// client.on('interactionCreate', async (interaction) => {
//     if (!interaction.inGuild()) return;

//     if (interaction.isStringSelectMenu()) {
//         if (interaction.customId === 'captcha_config_menu') {
//             const value = interaction.values[0];

//             if (value === 'canal') {
//                 const menu = new Discord.ChannelSelectMenuBuilder()
//                     .setCustomId('captcha_select_channel')
//                     .setPlaceholder('Selecione o canal')
//                     .setChannelTypes([Discord.ChannelType.GuildText]);

//                 return interaction.update({
//                     content: 'Escolha o canal:',
//                     components: [new Discord.ActionRowBuilder().addComponents(menu)],
//                     ephemeral: true
//                 });
//             }

//             if (value === 'add_roles' || value === 'remove_roles') {
//                 const roleKey = value === 'add_roles' ? 'addRoles' : 'removeRoles';
//                 const roleMenu = new Discord.RoleSelectMenuBuilder()
//                     .setCustomId(`captcha_select_roles_${roleKey}`)
//                     .setPlaceholder('Selecione os cargos')
//                     .setMinValues(1)
//                     .setMaxValues(5);

//                 return interaction.update({
//                     content: 'Escolha os cargos:',
//                     components: [new Discord.ActionRowBuilder().addComponents(roleMenu)],
//                     ephemeral: true
//                 });
//             }

//             if (value === 'reset') {
//                 const row = new Discord.ActionRowBuilder().addComponents(
//                     new Discord.ButtonBuilder().setCustomId('captcha_reset_yes').setLabel('Sim').setStyle(Discord.ButtonStyle.Danger),
//                     new Discord.ButtonBuilder().setCustomId('captcha_reset_no').setLabel('Não').setStyle(Discord.ButtonStyle.Secondary)
//                 );

//                 return interaction.update({
//                     content: 'Tem certeza que deseja resetar as configurações?',
//                     components: [row],
//                     ephemeral: true
//                 });
//             }
//         }
//     }

//     if (interaction.isChannelSelectMenu()) {
//         if (interaction.customId === 'captcha_select_channel') {
//             const channelId = interaction.values[0];
//             updateCaptchaConfig({ verifyChannel: channelId });

//             const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
//             if (!channel || !channel.isTextBased()) {
//                 return interaction.reply({ content: '❌ Canal inválido.', ephemeral: true });
//             }

//             const embed = new Discord.EmbedBuilder()
//                 .setTitle('Verificação')
//                 .setDescription('Clique no botão abaixo para se verificar e acessar o servidor.')
//                 .setColor('Blue');

//             const row = new Discord.ActionRowBuilder().addComponents(
//                 new Discord.ButtonBuilder().setCustomId('verificar').setLabel('Verificar').setStyle(Discord.ButtonStyle.Success),
//                 new Discord.ButtonBuilder().setCustomId('pq_verificar').setLabel('Por que verificar?').setStyle(Discord.ButtonStyle.Secondary)
//             );

//             await channel.send({ embeds: [embed], components: [row] });

//             return interaction.reply({
//                 content: `✅ Mensagem enviada no canal <#${channelId}>.`,
//                 ephemeral: true
//             });
//         }
//     }

//     if (interaction.isRoleSelectMenu()) {
//         const roleKey = interaction.customId.includes('addRoles') ? 'addRoles' : 'removeRoles';
//         updateCaptchaConfig({ [roleKey]: interaction.values });

//         return interaction.reply({ content: '✅ Cargos atualizados!', ephemeral: true });
//     }

//     if (interaction.isButton()) {
//         if (interaction.customId === 'captcha_reset_yes') {
//             resetCaptchaConfig();
//             return interaction.update({ content: '🔄 Configurações resetadas.', components: [] });
//         }

//         if (interaction.customId === 'captcha_reset_no') {
//             return interaction.update({ content: '❌ Cancelado.', components: [] });
//         }

//         if (interaction.customId === 'pq_verificar') {
//             return interaction.reply({
//                 content: 'Usamos verificação para impedir bots e proteger nosso servidor.',
//                 ephemeral: true
//             });
//         }

//         if (interaction.customId === 'verificar') {
//             const code = Math.random().toString(36).substring(2, 7).toUpperCase();
//             const image = await generateCaptcha(code);

//             // Gera 4 erradas únicas
//             const wrongs = new Set();
//             while (wrongs.size < 4) {
//                 const candidate = Math.random().toString(36).substring(2, 7).toUpperCase();
//                 if (candidate !== code) wrongs.add(candidate);
//             }

//             const options = [code, ...wrongs];
//             const shuffled = options.sort(() => Math.random() - 0.5);

//             // Cria os 5 botões
//             const row = new Discord.ActionRowBuilder().addComponents(
//                 shuffled.map(opt =>
//                     new Discord.ButtonBuilder()
//                         .setCustomId(`captcha_answer_${opt}_${code}`)
//                         .setLabel(opt)
//                         .setStyle(Discord.ButtonStyle.Primary)
//                 )
//             );


//             const embed = new Discord.EmbedBuilder()
//                 .setTitle('🔐 Verificação')
//                 .setDescription('Clique na opção correta para confirmar que você não é um robô.')
//                 .setImage('attachment://captcha.png')
//                 .setColor('Blurple');

//             return interaction.reply({
//                 embeds: [embed],
//                 files: [{ attachment: image, name: 'captcha.png' }],
//                 components: [row],
//                 ephemeral: true
//             });
//         }

//         if (interaction.customId.startsWith('captcha_answer_')) {
//             const [, answer, correct] = interaction.customId.split('_');

//             if (answer === correct) {
//                 const config = getCaptchaConfig();
//                 const member = interaction.member;

//                 for (const roleId of config.addRoles || []) {
//                     const role = interaction.guild.roles.cache.get(roleId);
//                     if (role) await member.roles.add(role).catch(() => {});
//                 }

//                 for (const roleId of config.removeRoles || []) {
//                     const role = interaction.guild.roles.cache.get(roleId);
//                     if (role) await member.roles.remove(role).catch(() => {});
//                 }

//                 return interaction.update({
//                     content: '✅ Verificação concluída com sucesso!',
//                     embeds: [],
//                     components: [],
//                     files: []
//                 });
//             } else {
//                 return interaction.update({
//                     content: '❌ Você errou o captcha. Tente novamente.',
//                     embeds: [],
//                     components: [],
//                     files: []
//                 });
//             }
//         }
//     }
// });