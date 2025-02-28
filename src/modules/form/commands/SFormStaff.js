const Discord = require("discord.js")

module.exports = {
    name: "sformstaff",
    description: "[SETUP] Envia a mensagem de form staff",
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
                    .setCustomId("start_formulario")
                    .setEmoji("<:Designsemnome1:1271571151012892783>")
                    .setLabel("Seja Staff")
                    .setStyle(2)
                    )
            ]
        });
        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });

    }
}
