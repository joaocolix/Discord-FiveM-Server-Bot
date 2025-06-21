const client = require('../../../index');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const codesFilePath = path.resolve(__dirname, '../database/json/codes.json');

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "start_code") {
            const modalCode = new Discord.ModalBuilder()
                .setCustomId("modalCode")
                .setTitle("Allowlist Express");

            const codeInput = new Discord.TextInputBuilder()
                .setCustomId("codeInput")
                .setLabel("Insira o seu token abaixo.")
                .setMaxLength(50)
                .setMinLength(5)
                .setPlaceholder("1234")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            modalCode.addComponents(
                new Discord.ActionRowBuilder().addComponents(codeInput)
            );

            await interaction.showModal(modalCode);
        }
    }
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modalCode") {
            const code = interaction.fields.getTextInputValue("codeInput");

            let codesData;
            try {
                codesData = JSON.parse(fs.readFileSync(codesFilePath, 'utf8'));
            } catch (error) {
                return interaction.reply({ content: 'Ops! Ocorreu um erro ao processar seu pedido. Tente novamente mais tarde.', flags: 1 << 6 });
            }

            if (codesData[code]) {
                if (codesData[code].usedBy) {
                    return interaction.reply({ content: `Esse token já foi utilizado.`, flags: 1 << 6 });
                } else {
                    codesData[code].usedBy = interaction.user.id;
                    try {
                        fs.writeFileSync(codesFilePath, JSON.stringify(codesData, null, 2));
                    } catch (error) {
                        return interaction.reply({ content: 'Ops! Não foi possível salvar as mudanças. Tente novamente mais tarde.', flags: 1 << 6 });
                    }

                    const roleID = '1271576799012458526';
                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    if (member) {
                        await member.roles.add(roleID);
                    }

                    return interaction.reply({ content: `Feito! Libere o seu ID no canal <#1212171713371054180>.`, flags: 1 << 6 });
                }
            } else {
                return interaction.reply({ content: `Inválido, esse codiguin não é válido.`, flags: 1 << 6 });
            }
        }
    }
});