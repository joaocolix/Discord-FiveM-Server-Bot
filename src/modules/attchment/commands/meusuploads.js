const Discord = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "meusuploads",
  description: "Veja seus arquivos hospedados na SquareCloud",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const squareToken = "533362436099538944-16bb12c71ef475bdb9a87c8f3c512293d89252fa7cead289cd606a2e14dfe1ff";
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    try {
      const response = await axios.get("https://blob.squarecloud.app/v1/objects?prefix=fivem", {
        headers: { Authorization: squareToken }
      });

      let uploads = response.data.response.objects
        .filter(obj => obj.id && obj.id.includes(userId)) 
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (!uploads.length) {
        return interaction.editReply("Você ainda não enviou nenhum arquivo.");
      }

      let page = 0;

      const gerarEmbed = (upload) => {
        const url = `https://public-blob.squarecloud.dev/${upload.id}`;
        const isImagem = upload.id.match(/\.(png|jpe?g|gif|webp)$/i);

        const embed = new Discord.EmbedBuilder()
          .setColor("Blue")
          .setTitle("Arquivo")
          .addFields(
            { name: "Nome", value: upload.id.split('_').slice(1).join('_') || "(sem nome)", inline: true },
            { name: "Tamanho", value: `${(upload.size / 1024).toFixed(1)} KB`, inline: true },
            { name: "Criado em", value: `<t:${Math.floor(new Date(upload.created_at).getTime() / 1000)}:f>` },
            { name: "Expira em", value: `<t:${Math.floor(new Date(upload.expires_at).getTime() / 1000)}:f>` },
            { name: "Link", value: `[Download](${url})` }
          );

        if (isImagem) {
          embed.setImage(url);
        }

        return embed;
      };

      const gerarBotoes = () => {
        return new Discord.ActionRowBuilder().addComponents(
          new Discord.ButtonBuilder()
            .setCustomId('prev_upload')
            .setEmoji('<:Designsemnome15:1364815984489402469>')
            .setStyle(Discord.ButtonStyle.Secondary)
            .setDisabled(page === 0),
          new Discord.ButtonBuilder()
            .setCustomId('delete_upload')
            .setEmoji('<:Designsemnome16:1364816293424795660>')
            .setStyle(Discord.ButtonStyle.Danger),
          new Discord.ButtonBuilder()
            .setCustomId('next_upload')
            .setEmoji('<:Designsemnome14:1364815687637270528>')
            .setStyle(Discord.ButtonStyle.Secondary)
            .setDisabled(page === uploads.length - 1)
        );
      };

      const msg = await interaction.editReply({
        embeds: [gerarEmbed(uploads[page])],
        components: [gerarBotoes()],
        fetchReply: true
      });

      const collector = msg.createMessageComponentCollector({
        time: 2 * 60_000,
        filter: i => i.user.id === userId
      });

      collector.on('collect', async i => {
        if (i.customId === 'prev_upload') {
          page = Math.max(0, page - 1);
        } else if (i.customId === 'next_upload') {
          page = Math.min(uploads.length - 1, page + 1);
        } else if (i.customId === 'delete_upload') {
            const upload = uploads[page];
          
            try {
              await axios.delete("https://blob.squarecloud.app/v1/objects", {
                headers: {
                  Authorization: squareToken,
                  "Content-Type": "application/json"
                },
                data: {
                  object: upload.id
                }
              });
          
              uploads.splice(page, 1);
              if (page >= uploads.length) page = uploads.length - 1;
          
              await i.deferUpdate();
          
              if (uploads.length === 0) {
                collector.stop();
                return interaction.editReply({
                  content: "Todos os arquivos foram apagados.",
                  embeds: [],
                  components: []
                });
              }
          
              return interaction.editReply({
                embeds: [gerarEmbed(uploads[page])],
                components: [gerarBotoes()]
              });
          
            } catch (err) {
              console.error(err);
              return i.reply({
                content: "Erro ao excluir o arquivo.",
                ephemeral: true
              }).catch(() => {});
            }
          }          
          

        await i.update({
          embeds: [gerarEmbed(uploads[page])],
          components: [gerarBotoes()]
        });
      });

    } catch (err) {
      console.error("Erro ao buscar arquivos:", err);
      return interaction.editReply("Erro ao buscar seus uploads.");
    }
  }
};
