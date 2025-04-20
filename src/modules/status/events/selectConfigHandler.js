const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const { gerarBanner } = require('../gerarBanner');
const client = require('../../../index');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId === 'edit_config_field') {
        const selectedField = interaction.values[0];

        if (selectedField === 'enviarEmbed') {
            await interaction.deferReply({ ephemeral: true });

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

            await interaction.editReply({
                content: 'Embed de status enviada com sucesso neste canal!',
            });

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

            await interaction.update({
                content: 'Escolha se deseja ativar ou desativar o modo manutenção:',
                components: [row]
            });

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

            await interaction.update({
                content: 'Selecione qual botão deseja editar:',
                components: [selectRow, actionRow]
            });

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

    if (interaction.isStringSelectMenu() && interaction.customId === 'select_button_to_edit') {
        const index = interaction.values[0];
        client.buttonEditSelection[interaction.user.id] = index;

        await interaction.deferUpdate();
        return;
    }

    if (interaction.isButton() && interaction.customId === 'botao_edit') {
        const index = client.buttonEditSelection[interaction.user.id];
        if (index === undefined) {
            return interaction.reply({ content: 'Você precisa selecionar um botão antes.', ephemeral: true });
        }

        const modal = new Discord.ModalBuilder()
            .setCustomId(`edit_button_modal:${index}`)
            .setTitle(`Editar Botão ${parseInt(index) + 1}`);

        const inputLabel = new Discord.TextInputBuilder()
            .setCustomId('label')
            .setLabel('Texto do botão')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputUrl = new Discord.TextInputBuilder()
            .setCustomId('url')
            .setLabel('URL do botão')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);

        const inputEmoji = new Discord.TextInputBuilder()
            .setCustomId('emoji')
            .setLabel('Emoji (opcional)')
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(false)
            .setPlaceholder('Ex: 🔥 ou emoji_id');

        modal.addComponents(
            new Discord.ActionRowBuilder().addComponents(inputLabel),
            new Discord.ActionRowBuilder().addComponents(inputUrl),
            new Discord.ActionRowBuilder().addComponents(inputEmoji)
        );

        await interaction.showModal(modal);
        return;
    }

    if (interaction.isButton() && interaction.customId === 'botao_remover') {
        const index = client.buttonEditSelection[interaction.user.id];
        if (index === undefined) {
            return interaction.reply({ content: 'Você precisa selecionar um botão antes.', ephemeral: true });
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            if (config.Server.buttons && config.Server.buttons[index]) {
                config.Server.buttons.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

                await interaction.deferUpdate(); 

                const updateStatus = require('./updateStatusMessage');
                if (typeof updateStatus.forceUpdate === 'function') {
                    await updateStatus.forceUpdate();
                }
            } else {
                await interaction.reply({ content: 'Esse botão já está vazio.', ephemeral: true });
            }
        } catch (err) {
            console.error('[BOTÕES] Erro ao remover botão:', err);
            await interaction.reply({ content: 'Erro ao remover o botão.', ephemeral: true });
        }

        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('edit_button_modal:')) {
        const index = parseInt(interaction.customId.split(':')[1]);
        const label = interaction.fields.getTextInputValue('label');
        const url = interaction.fields.getTextInputValue('url');
        const emoji = interaction.fields.getTextInputValue('emoji');

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            if (!config.Server.buttons) config.Server.buttons = [];

            config.Server.buttons[index] = {
                label: label.trim(),
                url: url.trim(),
                emoji: emoji?.trim() || null
            };

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            await interaction.deferUpdate(); 

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

        } catch (err) {
            console.error('[BOTÕES] Erro ao salvar botão:', err);
            await interaction.reply({
                content: 'Erro ao salvar o botão.',
                ephemeral: true
            });
        }

        return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith('edit_config_modal:')) {
        const field = interaction.customId.split(':')[1];
        const newValue = interaction.fields.getTextInputValue('new_value');

        try {
            const currentConfig = JSON.parse(fs.readFileSync(configPath));

            if (field === 'updateInterval') {
                const minutes = parseInt(newValue);
                if (isNaN(minutes) || minutes <= 0) {
                    return await interaction.update({
                        content: `O valor precisa ser um número maior que zero.`,
                        components: []
                    });
                }
                currentConfig.Server.updateInterval = minutes;
            } else {
                currentConfig.Server[field] = newValue;
            }

            fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 4));

            await interaction.update({
                content: `Campo **${field}** atualizado com sucesso!`,
                components: []
            });

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

            if (typeof updateStatus.setDynamicInterval === 'function') {
                updateStatus.setDynamicInterval();
            }
        } catch (err) {
            console.error('[CONFIG] Erro ao atualizar campo:', err);
            await interaction.update({
                content: `Erro ao atualizar o campo **${field}**.`,
                components: []
            });
        }
    }
});