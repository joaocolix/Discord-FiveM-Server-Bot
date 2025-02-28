const Discord = require("discord.js")

module.exports = {
    name: "painel",
    description: "[TICKET] Abra o painel.",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return interaction.reply({
            content: `Você não possui permissão para utilizar este comando.`,
            ephemeral: true,
        })

        await interaction.reply({
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.StringSelectMenuBuilder()
                            .setCustomId('options_staff')
                            .setPlaceholder('Painel')
                            .addOptions(
                                { label: 'Notificar', value: `notify_user`, emoji: '<:not:1174496490970959883>', description: 'Notifique o usuário que abriu o ticket.' },
                                { label: 'Renomear', value: `rename_channel`, emoji: '<:util:1176169735482773626>', description: 'Altere o nome do canal atual.' },
								{ label: 'Adicionar', value: `add_channel`, emoji: '<:add:1174493247062683792>', description: 'Adicione um usuário ao ticket.' },
								{ label: 'Remover', value: `rem_channel`, emoji: '<:rem:1174496911605125180>', description: 'Remova um usuário ao ticket.' },
                                { label: 'Finalizar', value: `delete_ticket`, emoji: '<:atalhos:1176712854137745408>', description: 'Finalize o ticket gerando transcript.' },
                            )
                    )
            ], ephemeral: true
        });
    }
}