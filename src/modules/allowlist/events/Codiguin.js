const client = require('../../../index');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const codesFilePath = path.resolve(__dirname, '../../../database/json/codes.json'); // Resolva o caminho absoluto

client.on("interactionCreate", async (interaction) => {
    // Verificação se a interação é de um botão
    if (interaction.isButton()) {
        if (interaction.customId === "start_code") {
            const modalCode = new Discord.ModalBuilder()
                .setCustomId("modalCode")
                .setTitle("CODIGUIN EUPHORIA");

            const codeInput = new Discord.TextInputBuilder()
                .setCustomId("codeInput")
                .setLabel("Insira o seu codiguin abaixo.")
                .setMaxLength(50)
                .setMinLength(5)
                .setPlaceholder("1234")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            // Adiciona o campo de entrada ao modal
            modalCode.addComponents(
                new Discord.ActionRowBuilder().addComponents(codeInput)
            );

            // Mostra o modal ao usuário
            await interaction.showModal(modalCode);
        }
    }
    // Verificação se a interação é de um modal
    else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modalCode") {
            const code = interaction.fields.getTextInputValue("codeInput");

            // Tenta ler o arquivo e manipula os possíveis erros
            let codesData;
            try {
                codesData = JSON.parse(fs.readFileSync(codesFilePath, 'utf8'));
            } catch (error) {
                return interaction.reply({ content: 'Ops! Ocorreu um erro ao processar seu pedido. Tente novamente mais tarde.', ephemeral: true });
            }

            // Verificação de validade do código
            if (codesData[code]) {
                if (codesData[code].usedBy) {
                    return interaction.reply({ content: `Esse codiguin já foi utilizado.`, ephemeral: true });
                } else {
                    // Marca o código como utilizado e salva
                    codesData[code].usedBy = interaction.user.id;
                    try {
                        fs.writeFileSync(codesFilePath, JSON.stringify(codesData, null, 2));
                    } catch (error) {
                        return interaction.reply({ content: 'Ops! Não foi possível salvar as mudanças. Tente novamente mais tarde.', ephemeral: true });
                    }

                    // Adiciona o cargo ao membro
                    const roleID = '1271576799012458526';
                    const member = interaction.guild.members.cache.get(interaction.user.id);
                    if (member) {
                        await member.roles.add(roleID);
                    }

                    // Responde com sucesso
                    return interaction.reply({ content: `Feito! Libere o seu ID no canal <#1212171713371054180>.`, ephemeral: true });
                }
            } else {
                // Código inválido
                return interaction.reply({ content: `Inválido, esse codiguin não é válido.`, ephemeral: true });
            }
        }
    }
});