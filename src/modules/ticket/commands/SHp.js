const Discord = require("discord.js")

module.exports = {
    name: "setuphp",
    description: "[SETUP] Envia a mensagem de ticket hp",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return interaction.reply({
            content: `Você não possui permissão para utilizar este comando.`,
            ephemeral: true,
        })

        await interaction.channel.send({
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_hospital')
                            .setEmoji("<:atalhos:1176712854137745408>")
                            .setLabel('Abrir')
                            .setStyle(2)
                    )
            ]
        });

        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });
    }
}