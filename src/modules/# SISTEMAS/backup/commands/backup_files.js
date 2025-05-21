const axios = require("axios");
const Discord = require("discord.js");

module.exports = {
  name: "backup",
  description: "Obtenha um backup disponível",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "licenca",
      description: "Escolha a sua licença",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    },
    {
      name: "arquivo",
      description: "Arquivo para baixar",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ],

  run: async (client, interaction) => {
    const tokenId = interaction.options.getString("licenca"); // agora vem o ID real
    const arquivoId = interaction.options.getString("arquivo");
    const squareToken = "533362436099538944-16bb12c71ef475bdb9a87c8f3c512293d89252fa7cead289cd606a2e14dfe1ff";

    try {
      const response = await axios.get("https://blob.squarecloud.app/v1/objects?prefix=fivem", {
        headers: { Authorization: squareToken }
      });

      const objeto = response.data.response.objects.find(obj => obj.id === arquivoId);
      if (!objeto) {
        return interaction.reply({ content: "Arquivo não encontrado.", flags: 1 << 6 });
      }

      const downloadUrl = `https://public-blob.squarecloud.dev/${objeto.id}?auto_download=true`;

      const embed = new Discord.EmbedBuilder()
        .setTitle("Backup")
        .setColor("Green")
        .addFields(
          { name: "Tamanho", value: `${(objeto.size / 1024).toFixed(1)} KB`, inline: true },
          { name: "Criado em", value: `<t:${Math.floor(new Date(objeto.created_at).getTime() / 1000)}:f>`, inline: false },
          { name: "Expira em", value: `<t:${Math.floor(new Date(objeto.expires_at).getTime() / 1000)}:f>`, inline: false },
          { name: "Download", value: `[Clique aqui](${downloadUrl})` }
        );

      return interaction.reply({ embeds: [embed], flags: 1 << 6 });

    } catch (err) {
      console.error("Erro ao buscar backups:", err);
      return interaction.reply({
        content: "Ocorreu um erro ao buscar o backup. Tente novamente.",
        flags: 1 << 6
      });
    }
  }
};