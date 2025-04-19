const Discord = require("discord.js")
const cfg = require("../../../configs/client.json")

module.exports = {
    name: "setupliberar",
    description: "[SETUP] Envia a mensagem de liberar",
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
                        .setCustomId('botao_liberar')
                        .setLabel('Liberar')
                        .setEmoji("<:emoji_34:1185974987954335904>")
                        .setStyle('3')
                      )
                    .addComponents(
                        new Discord.ButtonBuilder()
                        .setCustomId('botao_resetar')
                        .setLabel('Resetar')
                        .setEmoji("<:reset:1283414301213720587>")
                        .setStyle('2')
                    )
            ]
        });
        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });

    }
}