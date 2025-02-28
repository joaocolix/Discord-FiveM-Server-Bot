const Discord = require("discord.js")
const cfg = require("../../../configs/client.json")

module.exports = {
    name: "verificar",
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
                        .setLabel('Verificar')
                        .setEmoji("<:3_:1275224530637553694>")
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${cfg.client.id}&scope=identify%20guilds.join&response_type=code&redirect_uri=${encodeURIComponent(cfg.client.redirect_uri)}&permissions=8`)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                          .setCustomId('resp_verificar')
                          .setEmoji("<:pq:1280902014003318824>")
                          .setLabel('Porque verificar')
                          .setStyle(Discord.ButtonStyle.Primary)
                    )
            ]
        }); 
        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });

    }
}