const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const configPath = path.join(__dirname, '../data/server.json');
const client = require('../../../index');
const res = require('../../../utils/resTypes');

client.buttonEditSelection = {};

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'botao_remover') {
        const index = client.buttonEditSelection[interaction.user.id];
        if (index === undefined) {
            return interaction.reply(
                res.warning('Você precisa selecionar um botão antes.', { ephemeral: true })
            );
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath));
            if (!config.Server.buttons) config.Server.buttons = [];

            while (config.Server.buttons.length < 3) config.Server.buttons.push(null);

            config.Server.buttons[index] = null;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            const updateStatus = require('./updateStatusMessage');
            if (typeof updateStatus.forceUpdate === 'function') {
                await updateStatus.forceUpdate();
            }

            const hasAtLeastOne = config.Server.buttons.some(b => b);

            if (!hasAtLeastOne) {
                return interaction.update(
                    res.success('Todos os botões foram removidos com sucesso.', {
                        components: [],
                        ephemeral: true
                    })
                );
            }

            const options = config.Server.buttons.map((btn, i) => ({
                label: btn?.label || `Botão ${i + 1} (vazio)`,
                value: `${i}`
            }));

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

            return interaction.update(
                res.success('Botão removido com sucesso!', {
                    components: [selectRow, actionRow],
                    ephemeral: true
                })
            );
        } catch (err) {
            return interaction.reply(
                res.error('Erro ao remover o botão.', {
                    ephemeral: true
                })
            );
        }
    }
});