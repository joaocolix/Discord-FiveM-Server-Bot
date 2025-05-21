const axios = require("axios");
const { ApplicationCommandOptionType, ApplicationCommandType, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "licenca",
  description: "Gerencia as licenças",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: "0x8",
  options: [
    {
      name: "criar",
      description: "Cria uma nova licença",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "discord",
          description: "ID do Discord do usuário",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "nome",
          description: "Nome da licença",
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
          name: "dias",
          description: "Validade em dias",
          type: ApplicationCommandOptionType.Integer,
          required: true
        }
      ]
    },
    {
      name: "listar",
      description: "Lista todas as licenças",
      type: ApplicationCommandOptionType.Subcommand
    },
    {
      name: "remover",
      description: "Remove uma licença existente",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "id",
          description: "ID da licença",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();
    const API_URL = "https://api.apestudio.dev/api/licencas";

    if (sub === "criar") {
      const discord = interaction.options.getString("discord");
      const nome = interaction.options.getString("nome");
      const dias = interaction.options.getInteger("dias");

      try {
        const res = await axios.post(`${API_URL}/criar`, {
        discord,
        nome,
        dias
        }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sk_ape_lHX7T9h!5M3oGwXK2F@dYjUvN6qzLpR8"
        }
        });

        const licenca = res.data.licenca;

        const embed = new EmbedBuilder()
          .setTitle("Licença criada com sucesso")
          .addFields(
            { name: "Licença", value: `\`${licenca.id}\`` },
            { name: "Usuário", value: `<@${licenca.discord}> (${licenca.discord})` },
            { name: "Nome", value: licenca.nome },
            { name: "Expira em", value: `<t:${Math.floor(new Date(licenca.expira_em).getTime() / 1000)}:F>` }
          )
          .setColor("Green");

        return interaction.reply({ embeds: [embed], flags: 1 << 6 });

      } catch (err) {
        console.error("Erro no comando /licenca criar:", err);
        return interaction.reply({ content: "Erro ao criar a licença.", flags: 1 << 6 });
      }
    }

    if (sub === "listar") {
      try {
        const res = await axios.get(API_URL, {
        headers: {
            "Authorization": "Bearer sk_ape_lHX7T9h!5M3oGwXK2F@dYjUvN6qzLpR8"
        }
        });
        const licencas = res.data.licencas;

        if (!licencas.length) {
          return interaction.reply({ content: "Nenhuma licença cadastrada.", flags: 1 << 6 });
        }

        const embed = new EmbedBuilder()
          .setTitle("Licenças Cadastradas")
          .setColor("Blue");

        licencas.slice(0, 10).forEach((lic, index) => {
          embed.addFields({
            name: `${index + 1}. ${lic.nome}`,
            value: `ID: \`${lic.id}\`\nUser: <@${lic.discord}>\nExpira: <t:${Math.floor(new Date(lic.expira_em).getTime() / 1000)}:R>`,
            inline: false
          });
        });

        return interaction.reply({ embeds: [embed], flags: 1 << 6 });

      } catch (err) {
        console.error("Erro no comando /licenca listar:", err);
        return interaction.reply({ content: "Erro ao listar licenças.", flags: 1 << 6 });
      }
    }

    if (sub === "remover") {
      const id = interaction.options.getString("id");

      try {
        await axios.post(`${API_URL}/remover`, { id }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sk_ape_lHX7T9h!5M3oGwXK2F@dYjUvN6qzLpR8"
        }
        });
        return interaction.reply({ content: `Licença \`${id}\` removida com sucesso.`, flags: 1 << 6 });

      } catch (err) {
        console.error("Erro no comando /licenca remover:", err);
        return interaction.reply({ content: "Erro ao remover a licença. Verifique o ID.", flags: 1 << 6 });
      }
    }
  }
};