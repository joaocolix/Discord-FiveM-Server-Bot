const Discord = require("discord.js");

module.exports = {
  name: "add",
  description: "[TICKET] Adicione um usuario a esse canal.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuario",
      description: "Selecione o usuário para conceder acesso",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    let usuario = interaction.options.getUser("usuario");
    let canal = interaction.channel;

    canal.permissionOverwrites.edit(usuario.id, {
      ViewChannel: true,
      SendMessages: true
    })
    .then(() => {
      interaction.channel.sendTyping();
      interaction.reply({ content: `Feito!`, flags: 1 << 6 });
      interaction.channel.send({ content: `<:entrou:1243918811590037585> ${usuario} foi adicionado.`});
    })
    .catch(error => {
      interaction.reply({ content: "Houve um erro ao conceder o acesso. Por favor, tente novamente.", flags: 1 << 6 });
    });
  }
};