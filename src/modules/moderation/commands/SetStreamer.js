const Discord = require("discord.js");

module.exports = {
  name: "setstreamer",
  description: "[ADM] Conceda ou remova o cargo de streamer de um usuário",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuario",
      description: "Selecione o usuário para conceder ou remover o cargo de streamer",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageRoles)) {
      interaction.reply({ content: "Você não possui permissão para utilizar este comando.", ephemeral: true });
    } else {
      let usuario = interaction.options.getUser("usuario");
      let guildMember = interaction.guild.members.cache.get(usuario.id);
      let roleId = "1246535968786350275";

      if (guildMember.roles.cache.has(roleId)) {
        guildMember.roles.remove(roleId)
        .then(() => {
          interaction.channel.sendTyping();
          interaction.reply({ content: `O cargo de streamer foi removido de ${usuario}.`, ephemeral: true });
          interaction.channel.send({ content: `<:saiu:1243918812936540302> ${usuario} teve o cargo de streamer removido.`});
        })
        .catch(error => {
          interaction.channel.sendTyping();
          interaction.reply({ content: "Houve um erro ao remover o cargo. Por favor, tente novamente.", ephemeral: true });
        });
      } else {
        guildMember.roles.add(roleId)
        .then(() => {
          interaction.channel.sendTyping();
          interaction.reply({ content: `O cargo de streamer foi concedido a ${usuario}.`, ephemeral: true });
          interaction.channel.send({ content: `<:entrou:1243918811590037585> ${usuario} recebeu o cargo de streamer.`});
        })
        .catch(error => {
          interaction.channel.sendTyping();
          interaction.reply({ content: "Houve um erro ao conceder o cargo. Por favor, tente novamente.", ephemeral: true });
        });
      }
    }
  }
};
