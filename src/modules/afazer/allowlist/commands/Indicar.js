const Discord = require("discord.js");

module.exports = {
  name: 'indicar',
  description: '[MEMBRO] Indique um amigo para realizar a entrevista.',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'amigo',
      description: 'Qual amigo você deseja indicar?',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    }
  ],

  run: async (client, interaction) => {

    const roleToAddID = '1271576799012458526';
    const channelLogID = '1271628478382346240';

    const amigoIndicado = interaction.options.getUser('amigo');
    const membroIndicado = await interaction.guild.members.fetch(amigoIndicado.id).catch(console.error);

    if (!membroIndicado) {
      return interaction.reply({ flags: 1 << 6, content: 'Usuário não encontrado no servidor.' });
    }

    try {
      await membroIndicado.roles.add(roleToAddID);
      const embed = new Discord.EmbedBuilder()
        .setColor('#ffcc01')
        .setDescription(`INDICADOR: ${interaction.user} \nINDICADO: ${membroIndicado}`)
        .setFooter({ text: "Utilize /indicar para realizar uma indicação." });

      const logChannel = interaction.guild.channels.cache.get(channelLogID);
      if (!logChannel) {

        return interaction.reply({ flags: 1 << 6, content: 'Canal de log não encontrado.' });
      }

      await logChannel.send({ embeds: [embed] });
      await interaction.reply({ flags: 1 << 6, content: 'Sucesso, sua indicação foi enviada!' });
    } catch (error) {
      await interaction.reply({ flags: 1 << 6, content: 'Ocorreu um erro ao processar sua indicação.' });
    }
  }
};