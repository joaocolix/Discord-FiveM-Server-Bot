const Discord = require("discord.js")

module.exports = {
    name: "setup-button",
    description: "[SETUP] Envia a mensagem de verificar",
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
                        .setCustomId('auth_scripts')
                        .setLabel('Scripts')
                        .setStyle(Discord.ButtonStyle.Primary)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                          .setCustomId('auth_licenses')
                          .setLabel('Licenças')
                          .setStyle(Discord.ButtonStyle.Primary)
                    )
            ]
        }); 
        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });

    }
}