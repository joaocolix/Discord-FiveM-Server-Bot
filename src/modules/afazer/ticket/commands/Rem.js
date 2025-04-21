const Discord = require("discord.js");

module.exports = {
  name: "rem",
  description: "[TICKET] Remova um usuario desse canal.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuario",
      description: "Selecione o usuário para remover o acesso",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let usuario = interaction.options.getUser("usuario");
    let canal = interaction.channel;

    canal.permissionOverwrites.edit(usuario.id, {
      ViewChannel: false,
      SendMessages: false
    })
    .then(() => {
      interaction.channel.sendTyping();
      interaction.reply({ content: `Feito!`, flags: 1 << 6 });
      interaction.channel.send({ content: `<:saiu:1243918812936540302> ${usuario} foi removido.`});
    })
    .catch(error => {
      interaction.reply({ content: "Houve um erro ao remover o acesso. Por favor, tente novamente.", flags: 1 << 6 });
    });
  }
};