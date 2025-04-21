const Discord = require("discord.js");
require("dotenv").config();

const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=identify%20email%20guilds.join&response_type=code&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&permissions=8`;

module.exports = {
    name: "auth-verificar",
    description: "[SETUP] Envia a mensagem de verificar",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                flags: 1 << 6,
            });
        }

        await interaction.channel.send({
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setLabel('Verificar')
                            .setStyle(Discord.ButtonStyle.Link)
                            .setURL(authUrl)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('resp_verificar')
                            .setLabel('Porque verificar')
                            .setStyle(Discord.ButtonStyle.Primary)
                    )
            ]
        });

        interaction.reply({ content: `Feito! enviei no chat`, flags: 1 << 6 });
    }
};