const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const configPath = path.join(__dirname, '../data/sugestao.json');
let sugestaoConfig = require(configPath);

client.on('interactionCreate', async interaction => {
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'config_sugestao_menu') {
            const escolha = interaction.values[0];

            if (escolha === 'editar_prefixo') {
                const modal = new Discord.ModalBuilder()
                    .setCustomId('modal_prefixo')
                    .setTitle('Editar Prefixo');

                const input = new Discord.TextInputBuilder()
                    .setCustomId('prefixo_input')
                    .setLabel('Novo prefixo')
                    .setStyle(Discord.TextInputStyle.Short)
                    .setValue(sugestaoConfig.prefixo || '')
                    .setRequired(true);

                const row = new Discord.ActionRowBuilder().addComponents(input);
                modal.addComponents(row);

                return interaction.showModal(modal);
            }

            if (escolha === 'editar_canais') {
                const canais = interaction.guild.channels.cache
                    .filter(c => c.isTextBased() && c.viewable)
                    .map(c => ({
                        label: `#${c.name}`,
                        value: c.id,
                        default: sugestaoConfig.canaisPermitidos.includes(c.id)
                    }))
                    .slice(0, 25);

                const select = new Discord.StringSelectMenuBuilder()
                    .setCustomId('config_canais_select')
                    .setMinValues(1)
                    .setMaxValues(canais.length)
                    .setPlaceholder('Selecione os canais permitidos')
                    .addOptions(canais);

                const row = new Discord.ActionRowBuilder().addComponents(select);

                return interaction.update({
                    content: 'Selecione os canais para receber sugestões:',
                    components: [row],
                    flags: 1 << 6
                });
            }

            if (escolha === 'editar_topico') {
                const topicoSelect = new Discord.StringSelectMenuBuilder()
                    .setCustomId('config_topico_select')
                    .setPlaceholder('Escolha uma opção')
                    .addOptions([
                        { label: 'Ativado', value: 'true', default: sugestaoConfig.criarTopico },
                        { label: 'Desativado', value: 'false', default: !sugestaoConfig.criarTopico }
                    ]);

                const row = new Discord.ActionRowBuilder().addComponents(topicoSelect);

                return interaction.update({
                    content: `Escolha se deseja criar tópicos automaticamente ao receber uma sugestão:`,
                    components: [row],
                    flags: 1 << 6
                });
            }
        }

        if (interaction.customId === 'config_canais_select') {
            sugestaoConfig.canaisPermitidos = interaction.values;
            fs.writeFileSync(configPath, JSON.stringify(sugestaoConfig, null, 4));

            return interaction.update({
                content: `Canais atualizados com sucesso!\nAgora permitidos: ${interaction.values.map(id => `<#${id}>`).join(', ')}`,
                components: [ ],
                flags: 1 << 6
            });
        }

        if (interaction.customId === 'config_topico_select') {
            sugestaoConfig.criarTopico = interaction.values[0] === 'true';
            fs.writeFileSync(configPath, JSON.stringify(sugestaoConfig, null, 4));

            return interaction.update({
                content: `Criação de tópico agora está **${sugestaoConfig.criarTopico ? "ativada" : "desativada"}**.`,
                components: [ ],
                flags: 1 << 6
            });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_prefixo') {
            const novoPrefixo = interaction.fields.getTextInputValue('prefixo_input');
            sugestaoConfig.prefixo = novoPrefixo;
            fs.writeFileSync(configPath, JSON.stringify(sugestaoConfig, null, 4));

            return interaction.update({
                content: `Prefixo atualizado para: \`${novoPrefixo}\``,
                components: [ ],
                flags: 1 << 6
            });
        }
    }
});