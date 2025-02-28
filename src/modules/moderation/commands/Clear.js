const Discord = require("discord.js")

module.exports = {
    name: "clear",
    description: "[FERRAMENTA] Limpe até 99 mensagens.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'quantidade',
            description: 'Número de mensagens para serem apagadas.',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true,
        }
    ],

    run: async (client, interaction) => {
        let numero = interaction.options.getNumber('quantidade');

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
            interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true });
        } else {
            if (parseInt(numero) > 99 || parseInt(numero) <= 0) {
                interaction.reply({ content: 'Máximo 99', ephemeral: true });
            } else {
                interaction.channel.bulkDelete(parseInt(numero));
                interaction.channel.sendTyping();
                interaction.reply(` \`${numero}\` mensagens deletadas por <@${interaction.user.id}> em ${interaction.channel} `);

                let apagar_mensagem = "nao"; 

                if (apagar_mensagem === "sim") {
                    setTimeout(() => {
                        interaction.deleteReply();
                    }, 5000);
                } else if (apagar_mensagem === "nao") {
                    return;
                }
            }
        }
    }
};