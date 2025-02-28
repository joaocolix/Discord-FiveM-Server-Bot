const Discord = require("discord.js")

module.exports = {
  name: "dm",
  description: "[FERRAMENTA] Envie uma mensagem no privado de um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: "usuário",
        description: "Mencione um usuário.",
        type: Discord.ApplicationCommandOptionType.User,
        required: true,
    },
    {
        name: "mensagem",
        description: "Escreva algo para ser enviado.",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    }
],

  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {
        let user = interaction.options.getUser("usuário");
        let msg = interaction.options.getString("mensagem");

        user.send({ content:  `${msg}` }).then( () => {
            interaction.channel.sendTyping();
            interaction.reply({ content: `Feito!`, ephemeral: true });
        }).catch(e => {
            interaction.reply({ content: `A mensagem não foi enviada para ${user}, pois o usuário está com a DM fechada!`, ephemeral: true });
        })
    }
  }
}