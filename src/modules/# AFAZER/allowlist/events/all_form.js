const client = require('../../../index')
const Discord = require('discord.js')

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "start_allowlist") {
            const logsCanalID = "1280243315652165735";
            const allowlistCanalID = "1280939338649174067";

            const logsCanal = interaction.guild.channels.cache.get(logsCanalID);
            const allowlistCanal = interaction.guild.channels.cache.get(allowlistCanalID);

            if (!logsCanal || !allowlistCanal) return interaction.reply({ content: `Allowlist Fechada!.`, flags: 1 << 6 });

            const modalallowlist = new Discord.ModalBuilder()
                .setCustomId("modalallowlist")
                .setTitle("Allowlist");

            const perg1 = new Discord.TextInputBuilder()
                .setCustomId("perg1")
                .setLabel("Qual seu nome e idade? (REAL)")
                .setMaxLength(500)
                .setMinLength(50)
                .setPlaceholder("Exemplo: Henrique 18 anos")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short)

            const perg2 = new Discord.TextInputBuilder()
                .setCustomId("perg2")
                .setLabel("Oque é Dark Roleplay?")
                .setMaxLength(500)
                .setMinLength(50)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)

            const perg4 = new Discord.TextInputBuilder()
                .setCustomId("perg4")
                .setLabel("Explique Revenge Kill:")
                .setMaxLength(500)
                .setMinLength(50)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)

            const perg3 = new Discord.TextInputBuilder()
                .setCustomId("perg3")
                .setLabel("Descreva uma situação onde o VDM é permitido:")
                .setMaxLength(500)
                .setMinLength(50)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)

            const perg5 = new Discord.TextInputBuilder()
                .setCustomId("perg5")
                .setLabel("Conte sobre a história do seu personagem:")
                .setPlaceholder("Digite aqui...")
                .setMaxLength(4000)
                .setMinLength(1000)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true)


            modalallowlist.addComponents(
                new Discord.ActionRowBuilder().addComponents(perg1),
                new Discord.ActionRowBuilder().addComponents(perg2),
                new Discord.ActionRowBuilder().addComponents(perg3),
                new Discord.ActionRowBuilder().addComponents(perg4),
                new Discord.ActionRowBuilder().addComponents(perg5)
            )

            await interaction.showModal(modalallowlist);

        } else if (interaction.customId.includes("botao_aceitar")) {
            await interaction.message.edit({
                components: [new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId("botao_aceitar")
                            .setDisabled(true)
                            .setLabel(`Aceito por ${interaction.user.tag}`)
                            .setStyle(3),

						
                    )
                ]
            })

            const userID = interaction.customId.split(" ")[1];
            const member = interaction.guild.members.cache.get(userID);
            if(member) member.roles.add('1271576799012458526');

            const allowlistChannelID = "1222364981165690960";
            interaction.reply({ content: `O usuário <@${userID}> foi aprovado.`, flags: 1 << 6 });
            const allowlistChannel = interaction.guild.channels.cache.get(allowlistChannelID);

        } else if (interaction.customId.includes("botao_recusar")) {
            await interaction.message.edit({
                components: [new Discord.ActionRowBuilder()
                    .addComponents(

                        new Discord.ButtonBuilder()
                            .setCustomId("botao_recusar")
                            .setDisabled(true)
                            .setLabel(`Recusado por ${interaction.user.tag}`)
                            .setStyle(4),
                    )
                ]
            })

            const userID = interaction.customId.split(" ")[1];
            const member = interaction.guild.members.cache.get(userID);

            const allowlistChannelID = "1280243257649008853";

            const allowlistChannel = interaction.guild.channels.cache.get(allowlistChannelID);

            if (allowlistChannel) {
                await allowlistChannel.send(`<:21:1165693037964431510> <@${userID}> Você foi reprovado em nossa allowlist você pode tentar novamente quando quiser.`);
            }

            interaction.reply({ content: `O usuário <@${userID}> foi recusado.`, flags: 1 << 6 });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modalallowlist") {
            const logsCanalID = "1280243315652165735";
            const logsCanal = interaction.guild.channels.cache.get(logsCanalID);

            const allowlistCanalID = "1280243257649008853";
            const allowlistCanal = interaction.guild.channels.cache.get(allowlistCanalID);

            let resp1 = interaction.fields.getTextInputValue("perg1")
            let resp2 = interaction.fields.getTextInputValue("perg2")
            let resp3 = interaction.fields.getTextInputValue("perg3")
            let resp4 = interaction.fields.getTextInputValue("perg4")
            let resp5 = interaction.fields.getTextInputValue("perg5")

            let embed = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`## ALLOWLIST DE ${interaction.user}`)
                .setFooter({ text: `Formulário de ${interaction.user.id} - pág. 1/2` })
                .addFields(
                    {
                        name: `Qual seu nome e idade?`,
                        value: `${resp1}`,
                        inline: false
                    },
                    {
                        name: `Oque é Dark Roleplay?`,
                        value: `${resp2}`,
                        inline: false
                    },
                    {
                        name: `Descreva uma situação onde o VDM permitido:`,
                        value: `${resp3}`,
                        inline: false
                    },
                    {
                        name: `Explique Revenge Kill:`,
                        value: `${resp4}`,
                        inline: false
                    }
                );

            let embedResp5 = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setFooter({ text: `Formulário de ${interaction.user.id} - pág. 2/2` })
                .setDescription(`**Conte sobre a história do seu personagem:** \n ${resp5}`);

                interaction.channel.sendTyping();
            interaction.reply({ content: `**${interaction.user.username}** seu formulário foi enviado com sucesso!`, flags: 1 << 6 })
            if (logsCanal) {
                await logsCanal.send({
                    embeds: [embed, embedResp5],
                    components: [new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId("botao_aceitar " + interaction.user.id)
                                .setLabel("Aceitar")
                                .setStyle(3),

                            new Discord.ButtonBuilder()
                                .setCustomId("botao_recusar " + interaction.user.id)
                                .setLabel("Recusar")
                                .setStyle(4),
                        )
                    ]
                });
            }

        }
    }
})