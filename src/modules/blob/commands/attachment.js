const Discord = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

module.exports = {
  name: "attachment",
  description: "Hospede um arquivo na SquareCloud com expiração, segurança e nome customizado.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "arquivo",
      description: "O arquivo que você quer hospedar",
      type: Discord.ApplicationCommandOptionType.Attachment,
      required: true
    },
    {
      name: "expiracao",
      description: "Por quanto tempo o arquivo ficará disponível",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "1 dia", value: "1" },
        { name: "7 dias", value: "7" },
        { name: "15 dias", value: "15" },
        { name: "30 dias", value: "30" },
        { name: "90 dias", value: "90" },
        { name: "Nunca (365 dias)", value: "0" }
      ]
    },
    {
      name: "autodownload",
      description: "Deve baixar automaticamente ao abrir o link?",
      type: Discord.ApplicationCommandOptionType.Boolean,
      required: false
    },
    {
      name: "seguranca",
      description: "Requerer hash de segurança para acessar o arquivo?",
      type: Discord.ApplicationCommandOptionType.Boolean,
      required: false
    },
    {
      name: "nome",
      description: "Nome personalizado para o arquivo (sem extensão)",
      type: Discord.ApplicationCommandOptionType.String,
      required: false
    }
  ],

  run: async (client, interaction) => {
    const file = interaction.options.getAttachment("arquivo");
    const expiration = interaction.options.getString("expiracao");
    const autoDownload = interaction.options.getBoolean("autodownload") ?? true;
    const usarHash = interaction.options.getBoolean("seguranca") ?? false;
    const nomeCustomizado = interaction.options.getString("nome");
    const userId = interaction.user.id;
    const squareToken = "533362436099538944-16bb12c71ef475bdb9a87c8f3c512293d89252fa7cead289cd606a2e14dfe1ff";

    if (!file || file.size > 100 * 1024 * 1024) {
      return interaction.reply({
        content: "O arquivo não foi fornecido ou ultrapassa 100MB.",
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const extensao = path.extname(file.name);
      const fileName = nomeCustomizado ? `${nomeCustomizado}${extensao}` : path.basename(file.name);

      let objectName = nomeCustomizado || path.parse(file.name).name;
      objectName = `${userId}_${objectName}`
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/^[_\d]+/, 'bkp')
        .replace(/_+$/, '')
        .slice(0, 32);

      const buffer = await axios.get(file.url, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data));

      const form = new FormData();
      form.append('file', buffer, {
        filename: fileName,
        contentType: file.contentType || 'application/octet-stream'
      });

      const dias = expiration === "0" ? "365" : expiration;
      const queryParams = new URLSearchParams({
        name: objectName,
        prefix: "fivem",
        expire: dias
      });
      if (usarHash) queryParams.set("security_hash", "true");

      const response = await axios.post(
        `https://blob.squarecloud.app/v1/objects?${queryParams.toString()}`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: squareToken
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (response.data.status !== "success") throw new Error("Falha ao fazer upload.");

      const fileUrl = response.data.response.url;
      const hash = response.data.response.hash;
      const urlBase = usarHash ? `${fileUrl}?hash=${hash}` : fileUrl;
      const finalUrl = autoDownload ? `${urlBase}${usarHash ? '&' : '?'}auto_download=true` : urlBase;

      const embed = new Discord.EmbedBuilder()
        .setTitle("Arquivo enviado com sucesso!")
        .setColor("Green")
        .setDescription(`[Clique aqui para acessar o arquivo](${finalUrl})`)
        .addFields(
          { name: "Nome", value: fileName, inline: true },
          { name: "Tamanho", value: `${(file.size / 1024).toFixed(1)} KB`, inline: true },
          { name: "Expiração", value: expiration === "0" ? "Nunca (365 dias)" : `${expiration} dia(s)`, inline: true },
          { name: "Auto Download", value: autoDownload ? "Sim" : "Não", inline: true },
          { name: "Hash de Segurança", value: usarHash ? "Ativado" : "Desativado", inline: true }
        );

      return interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      return interaction.editReply({
        content: "Erro ao enviar o arquivo. Verifique as configurações e tente novamente.",
        ephemeral: true
      });
    }
  }
};