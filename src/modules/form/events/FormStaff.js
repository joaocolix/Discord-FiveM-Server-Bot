const client = require('../../../index')
const Discord = require('discord.js')

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "start_formulario") {
            const logsCanalID = "1266739454211522610";
            const formCanalID = "1141057239042498560";

            const logCanal = interaction.guild.channels.cache.get(logsCanalID);
            const formCanal = interaction.guild.channels.cache.get(formCanalID);

            if (!logCanal || !formCanal) return interaction.reply({ content: `Processo fechado!.`, ephemeral: true });

            const modalform = new Discord.ModalBuilder()
                .setCustomId("modalform")
                .setTitle("Formulário");

            const perg1 = new Discord.TextInputBuilder()
                .setCustomId("perg1")
                .setLabel("Qual seu nome e idade? (REAL)")
                .setMaxLength(500)
                .setMinLength(20)
                .setPlaceholder("Digite aqui...")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short)

            const perg2 = new Discord.TextInputBuilder()
                .setCustomId("perg2")
                .setLabel("A quanto tempo você joga roleplay?")
                .setMaxLength(500)
                .setMinLength(20)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
          
            const perg3 = new Discord.TextInputBuilder()
                .setCustomId("perg3")
                .setLabel("Qual a sua disponibilidade diaria?")
                .setMaxLength(500)
                .setMinLength(20)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Short)
                .setRequired(true)
          
            const perg4 = new Discord.TextInputBuilder()
                .setCustomId("perg4")
                .setLabel("Porque deseja fazer parte de nossa equipe?")
                .setMaxLength(2000)
                .setMinLength(20)
                .setPlaceholder("Digite aqui...")
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true)

            const perg5 = new Discord.TextInputBuilder()
                .setCustomId("perg5")
                .setLabel("Liste 3 qualidades e 3 defeitos seus:")
                .setPlaceholder("Digite aqui...")
                .setMaxLength(2000)
                .setMinLength(20)
                .setStyle(Discord.TextInputStyle.Paragraph)
                .setRequired(true)


            modalform.addComponents(
                new Discord.ActionRowBuilder().addComponents(perg1),
                new Discord.ActionRowBuilder().addComponents(perg2),
                new Discord.ActionRowBuilder().addComponents(perg3),
                new Discord.ActionRowBuilder().addComponents(perg4),
                new Discord.ActionRowBuilder().addComponents(perg5)
            )

            await interaction.showModal(modalform);

        } else if (interaction.customId.includes("aceitar")) {
            await interaction.message.edit({
                components: [new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId("aceitar")
                            .setDisabled(true)
                            .setLabel(`Aceito por ${interaction.user.tag}`)
                            .setStyle(3),

						
                    )
                ]
            })

            const userID = interaction.customId.split(" ")[1];
            const member = interaction.guild.members.cache.get(userID);
          
            interaction.reply({ content: `O usuário <@${userID}> foi aprovado.`, ephemeral: true });
          
            const formChannelID = "1246358213016948767";

            const formChannel = interaction.guild.channels.cache.get(formChannelID);

            if (formChannel) {
                await formChannel.send(`<:22:1227621566884610160> <@${userID}> Você foi aprovado, entre em contato com o Responsável Staff`);
            }

        } else if (interaction.customId.includes("recusar")) {
            await interaction.message.edit({
                components: [new Discord.ActionRowBuilder()
                    .addComponents(

                        new Discord.ButtonBuilder()
                            .setCustomId("recusar")
                            .setDisabled(true)
                            .setLabel(`Recusado por ${interaction.user.tag}`)
                            .setStyle(4),
                    )
                ]
            })

            const userID = interaction.customId.split(" ")[1];
            const member = interaction.guild.members.cache.get(userID);

            interaction.reply({ content: `O usuário <@${userID}> foi recusado.`, ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modalform") {
            const logsCanalID = "1266739454211522610";
            const logCanal = interaction.guild.channels.cache.get(logsCanalID);

            const formCanalID = "1246358213016948767";
            const formCanal = interaction.guild.channels.cache.get(formCanalID);

            let resp1 = interaction.fields.getTextInputValue("perg1")
            let resp2 = interaction.fields.getTextInputValue("perg2")
            let resp3 = interaction.fields.getTextInputValue("perg3")
            let resp4 = interaction.fields.getTextInputValue("perg4")
            let resp5 = interaction.fields.getTextInputValue("perg5")

            let embed = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setDescription(`## FORMULÁRIO DE ${interaction.user}`)
                .setFooter({ text: `Formulário de ${interaction.user.id} - pág. 1/2` })
                .addFields(
                    {
                        name: `Qual seu nome e idade? (REAL)`,
                        value: `${resp1}`,
                        inline: false
                    },
                    {
                        name: `A quanto tempo você joga roleplay?`,
                        value: `${resp2}`,
                        inline: false
                    },
                    {
                        name: `Qual a sua disponibilidade diaria?`,
                        value: `${resp3}`,
                        inline: false
                    },
                    {
                        name: `Porque deseja fazer parte de nossa equipe?`,
                        value: `${resp4}`,
                        inline: false
                    }
                );

            let embedResp5 = new Discord.EmbedBuilder()
                .setColor("#2b2d31")
                .setFooter({ text: `Formulário de ${interaction.user.id} - pág. 2/2` })
                .setDescription(`**Liste 3 qualidades e 3 defeitos seus:** \n ${resp5}`);

                interaction.channel.sendTyping();
            interaction.reply({ content: `**${interaction.user.username}** seu formulário foi enviado com sucesso!`, ephemeral: true })
            if (logCanal) {
                await logCanal.send({
                    embeds: [embed, embedResp5],
                    components: [new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId("aceitar " + interaction.user.id)
                                .setLabel("Aceitar")
                                .setStyle(3),

                            new Discord.ButtonBuilder()
                                .setCustomId("recusar " + interaction.user.id)
                                .setLabel("Recusar")
                                .setStyle(4),
                        )
                    ]
                });
            }

        }
    }
})