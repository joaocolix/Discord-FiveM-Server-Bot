const Discord = require("discord.js");

module.exports = {
    name: "ticket",
    description: "[SETUP] Envia a mensagem de ticket",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `Você não possui permissão para utilizar este comando.`,
                ephemeral: true,
            });
        }

        await interaction.channel.send({
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_suporte')
                            .setEmoji("<:atalhos:1176712854137745408>")
                            .setLabel('Suporte')
                            .setStyle(Discord.ButtonStyle.Secondary)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_denuncia')
                            .setEmoji("<:denuncia:1245068207803465788>")
                            .setLabel('Denunciar')
                            .setStyle(Discord.ButtonStyle.Danger)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_financeiro')
                            .setLabel('Financeiro')
                            .setEmoji("<:money:1245067595976151131>")
                            .setStyle(Discord.ButtonStyle.Success)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('start_bugs')
                            .setEmoji("<:bugs:1245067176914976830>")
                            .setLabel('Bugs')
                            .setStyle(Discord.ButtonStyle.Primary)
                    )
            ]
        });

        interaction.reply({ content: `Feito! enviei no chat`, ephemeral: true });
    }
};
