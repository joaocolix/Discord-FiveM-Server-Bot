const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');
const res = require('../../../utils/resTypes');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'edit_config_field') {
        const selectedField = interaction.values[0];

        if (selectedField === 'enviarEmbed') {

            const config = JSON.parse(fs.readFileSync(configPath));
            const status = 'carregando';

            const bannerBuffer = await gerarBanner({
                status,
                jogadores: 'Carregando...',
                reinicio: 'Calculando...'
            });

            const bannerAttachment = new Discord.AttachmentBuilder(bannerBuffer, { name: 'status.png' });

            const embed = new Discord.EmbedBuilder()
                .setColor('#00C8FF')
                .addFields(
                    { name: 'IP SERVIDOR:', value: `\`\`\`${config.Server.serverConnect}\`\`\``, inline: false },
                    { name: 'JOGADORES:', value: '```Carregando...```', inline: true },
                    { name: 'REINÍCIO:', value: '```Calculando...```', inline: true }
                )
                .setFooter({ text: `Última vez atualizado: aguardando...` })
                .setImage('attachment://status.png');

            const btns = (config.Server.buttons || []).slice(0, 3);
            const row = new Discord.ActionRowBuilder();

            btns.forEach(btn => {
                const button = new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Link)
                    .setLabel(btn.label)
                    .setURL(btn.url);
                if (btn.emoji) button.setEmoji(btn.emoji);
                row.addComponents(button);
            });

            const messagePayload = {
                embeds: [embed],
                files: [bannerAttachment]
            };

            if (btns.length > 0) messagePayload.components = [row];

            const sentMessage = await interaction.channel.send(messagePayload);

            client.statusMessage = sentMessage;

            config.Server.statusMessageId = sentMessage.id;
            config.Server.statusChannelId = sentMessage.channel.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            await interaction.update(
                res.success('Embed de status enviada com sucesso neste canal!', {
                    components: [],
                    ephemeral: true
                })
            );

            return;
        }

        if (selectedField === 'setManutencao') {
            const manutencaoMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('set_manutencao_status')
                .setPlaceholder('Selecionar ação para manutenção')
                .addOptions([
                    { label: 'Ativar manutenção', value: 'ativar' },
                    { label: 'Desativar manutenção', value: 'desativar' }
                ]);

            const row = new Discord.ActionRowBuilder().addComponents(manutencaoMenu);

            await interaction.update(
                res.info('Escolha se deseja ativar ou desativar o modo manutenção:', {
                    components: [row],
                    content: ``,
                    ephemeral: true
                })
            );

            return;
        }

        if (selectedField === 'updateInterval') {
            const modal = new Discord.ModalBuilder()
                .setCustomId(`edit_config_modal:updateInterval`)
                .setTitle(`Atualizar intervalo (minutos)`);

            const input = new Discord.TextInputBuilder()
                .setCustomId('new_value')
                .setLabel('Informe o intervalo em minutos')
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Ex: 5');

            const row = new Discord.ActionRowBuilder().addComponents(input);
            modal.addComponents(row);

            await interaction.showModal(modal);
            return;
        }

        if (selectedField === 'editButtons') {
            const config = JSON.parse(fs.readFileSync(configPath));
            const btns = config.Server.buttons || [];
            
            const options = [0, 1, 2].map(i => {
                const btn = btns[i];
                return {
                    label: btn?.label || `Botão ${i + 1} (vazio)`,
                    value: `${i}`
                };
            });
            
            const buttonSelector = new Discord.StringSelectMenuBuilder()
                .setCustomId('select_button_to_edit')
                .setPlaceholder('Escolha qual botão deseja editar')
                .addOptions(options);            

            const selectRow = new Discord.ActionRowBuilder().addComponents(buttonSelector);
            const actionRow = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('botao_edit')
                    .setLabel('Editar')
                    .setStyle(Discord.ButtonStyle.Success),
                new Discord.ButtonBuilder()
                    .setCustomId('botao_remover')
                    .setLabel('Remover')
                    .setStyle(Discord.ButtonStyle.Danger)
            );

            await interaction.update(
                res.info('Selecione qual botão deseja editar:', {
                    components: [selectRow, actionRow],
                    content: ``,
                    ephemeral: true
                })
            );

            return;
        }

        const currentConfig = JSON.parse(fs.readFileSync(configPath));
        const currentValue = currentConfig.Server[selectedField] || '';

        const modal = new Discord.ModalBuilder()
            .setCustomId(`edit_config_modal:${selectedField}`)
            .setTitle(`Editar ${selectedField}`);

        const input = new Discord.TextInputBuilder()
            .setCustomId('new_value')
            .setLabel(`Novo valor para ${selectedField}`)
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true)
            .setValue(currentValue);

        const row = new Discord.ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
});