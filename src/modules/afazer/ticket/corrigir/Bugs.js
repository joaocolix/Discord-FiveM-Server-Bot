const client = require('../../../index')
const Discord = require('discord.js');

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "start_bugs") {
            const logsCanalID = "1313510998405287936";
            const logsCanal = interaction.guild.channels.cache.get(logsCanalID);

            if (!logsCanal) return interaction.reply({ content: `O sistema está desativado.`, flags: 1 << 6 });

            const modalBugs = new Discord.ModalBuilder()
                .setCustomId("modalBugs")
                .setTitle("Relatório de Bug");

            const perg2 = new Discord.TextInputBuilder()
                .setCustomId("perg2")
                .setLabel("DETALHES DO BUG")
                .setMaxLength(500)
                .setMinLength(1)
                .setPlaceholder("Descreva os detalhes do bug")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Paragraph);

            const perg3 = new Discord.TextInputBuilder()
                .setCustomId("perg3")
                .setLabel("COMO FEZ PARA FAZER")
                .setMaxLength(500)
                .setMinLength(1)
                .setPlaceholder("Explique como reproduzir o bug")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Paragraph);

            const perg4 = new Discord.TextInputBuilder()
                .setCustomId("perg4")
                .setLabel("VIDEO UPADO NO YOUTUBE MOSTRANDO O BUG")
                .setMaxLength(500)
                .setMinLength(1)
                .setPlaceholder("Insira o link do vídeo")
                .setRequired(false)
                .setStyle(Discord.TextInputStyle.Short);

            modalBugs.addComponents(
                new Discord.ActionRowBuilder().addComponents(perg2),
                new Discord.ActionRowBuilder().addComponents(perg3),
                new Discord.ActionRowBuilder().addComponents(perg4)
            );

            await interaction.showModal(modalBugs);

        } else if (interaction.customId.startsWith("botao_responder")) {
            const userID = interaction.customId.split(" ")[1];
            const user = await client.users.fetch(userID);

            const modalResponder = new Discord.ModalBuilder()
                .setCustomId(`modalResponder_${userID}`)
                .setTitle("Responder");

            const respInput = new Discord.TextInputBuilder()
                .setCustomId("resposta")
                .setLabel("Sua Resposta")
                .setMaxLength(4000)
                .setMinLength(5)
                .setPlaceholder("Digite sua resposta aqui")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Paragraph);

            modalResponder.addComponents(
                new Discord.ActionRowBuilder().addComponents(respInput)
            );

            await interaction.showModal(modalResponder);
            interaction.channel.sendTyping();
            interaction.reply({ content: `Modal de resposta enviado para ${user.tag}.`, flags: 1 << 6 });
        } else if (interaction.customId.startsWith("botao_resolvido")) {
            const userID = interaction.customId.split(" ")[1];

            await interaction.update({
                content: `O problema foi marcado como resolvido.`,
                components: [
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId(`botao_resolvido ${userID}`)
                            .setLabel("Resolvido")
                            .setStyle(2)
                            .setDisabled(true)
                    )
                ]
            });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modalBugs") {
            const logsCanalID = "1281255176463978496";
            const logsCanal = interaction.guild.channels.cache.get(logsCanalID);

            let resp2 = interaction.fields.getTextInputValue("perg2");
            let resp3 = interaction.fields.getTextInputValue("perg3");
            let resp4 = interaction.fields.getTextInputValue("perg4") || 'Não enviado';

            const member = interaction.guild.members.cache.get(interaction.user.id);
            const displayName = member ? member.displayName : interaction.user.username;

            let embed = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setTitle(`**NOVO BUG REPORTADO**`)
                .addFields(
                    { name: `**Usuário:**`, value: `<@${interaction.user.id}> | ${displayName}`, inline: true },
                    { name: `**Vídeo:**`, value: `${resp4}`, inline: true },
                    { name: `**Bug:**`, value: `\`\`\`${resp2}\`\`\``, inline: false },
                    { name: `**Como foi descoberto:**`, value: `\`\`\`${resp3}\`\`\``, inline: false }
                );

            interaction.reply({ content: `**${interaction.user.username}** seu relatório de bug foi enviado com sucesso!`, flags: 1 << 6 });

            if (logsCanal) {
                await logsCanal.send({
                    embeds: [embed],
                    components: [
                        new Discord.ActionRowBuilder().addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId(`botao_responder ${interaction.user.id}`)
                                .setLabel("Responder")
                                .setStyle(2),
                            new Discord.ButtonBuilder()
                                .setCustomId(`botao_resolvido ${interaction.user.id}`)
                                .setLabel("Resolvido")
                                .setStyle(3)
                        )
                    ]
                });
            }

        } else if (interaction.customId.startsWith("modalResponder_")) {
            const resposta = interaction.fields.getTextInputValue("resposta");
            const userID = interaction.customId.split("_")[1];
            const user = await client.users.fetch(userID);

            if (user) {
                user.send(`Olá ${user.username}!\nA gente notou que você recentemente reportou um bug para nossa equipe. Nossos desenvolvedores deixaram um recado:\n\n<:norris2:1125956267702226954> **Mensagem:** ${resposta}`).catch(console.error);
                interaction.reply({ content: `Resposta enviada para ${user.tag}.`, flags: 1 << 6 });
            } else {
                interaction.reply({ content: `Usuário não encontrado.`, flags: 1 << 6 });
            }
        }
    }
});