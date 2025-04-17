const Discord = require("discord.js")

module.exports = {
    name: "allowlist",
    description: "[SETUP] Envia a mensagem de allowlist",
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
                            .setCustomId('start_allowlist')
                            .setLabel('Allowlist')
                            .setEmoji("<:all:1244631030237888572>")
                            .setStyle(2),
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_code')
                            .setLabel('Codiguin')
                            .setEmoji("<:Designsemnome5:1271567340152164393>")
                            .setStyle(3),
                    ),
            ]
        });
        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });

    }
}