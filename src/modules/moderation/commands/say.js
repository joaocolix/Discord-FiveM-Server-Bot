const Discord = require("discord.js")

module.exports = {
  name: "say",
  description: "[FERRAMENTA] Faça eu falar",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: "texto",
        description: "Falarei o que vc disser",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    }
],

  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {
        let texto_fala = interaction.options.getString("texto");
        interaction.channel.sendTyping();
        interaction.reply({ content: `Feito!`, ephemeral: true })
        interaction.channel.send({ content: `${texto_fala}` })
    }
  }
}