const Discord = require("discord.js");
const { whitelist } = require("../../../database/database.js");

module.exports = {
  name: "lastlogin",
  description: "[FERRAMENTA] Retorna o último login de um usuário.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "usuário",
      description: "Mencione um usuário ou forneça o ID.",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true });
    }

    let user = interaction.options.getUser("usuário");

    try {
      // Busca o usuário no banco de dados pelo ID do Discord
      const dbUser = await whitelist.findOne({ where: { discord: user.id } });

      if (!dbUser) {
        return interaction.reply({ content: `Usuário não encontrado no banco de dados.`, ephemeral: true });
      }

      // Verificação e formatação da data do último login
      const lastLogin = dbUser.last_login ? new Date(dbUser.last_login).toDateString() : 'Data de login não disponível';

      // Envia a resposta com a data do último login
      await interaction.reply({ content: `Último login de ${user}: ${lastLogin}`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: 'Erro ao buscar o último login. Tente novamente mais tarde.', ephemeral: true });
    }
  }
};
