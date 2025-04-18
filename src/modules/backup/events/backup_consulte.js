const client = require("../../../index");
const axios = require("axios");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const focused = interaction.options.getFocused(true);
  const userId = interaction.user.id;
  const squareToken = "533362436099538944-16bb12c71ef475bdb9a87c8f3c512293d89252fa7cead289cd606a2e14dfe1ff";

  if (interaction.commandName === "backup" && focused.name === "licenca") {
    try {
      const response = await axios.get("https://api.apestudio.dev/api/licencas", {
        headers: {
          Authorization: "Bearer sk_ape_lHX7T9h!5M3oGwXK2F@dYjUvN6qzLpR8"
        }
      });
      const licencas = response.data.licencas;

      const minhasLicencas = licencas
        .filter(l => l.discord === userId)
        .slice(0, 25)
        .map(l => ({
          name: `${l.nome} (expira <t:${Math.floor(new Date(l.expira_em).getTime() / 1000)}:R>)`,
          value: l.id
        }));

      return interaction.respond(minhasLicencas);
    } catch (e) {
      console.log("Erro ao buscar licenças:", e.message);
      return interaction.respond([]);
    }
  }

  if (interaction.commandName === "backup" && focused.name === "arquivo") {
    const token = interaction.options.getString("licenca");
    if (!token) return interaction.respond([]);

    try {
      const res = await axios.get("https://blob.squarecloud.app/v1/objects?prefix=fivem", {
        headers: { Authorization: squareToken }
      });

      const arquivos = res.data.response.objects.filter(obj => obj.id.includes(token));

      const choices = arquivos.slice(0, 25).map(obj => {
        const fileName = obj.id.split("/").pop();
        const match = fileName.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);

        let dataFormatada = "Sem data";
        if (match) {
          const [, ano, mes, dia, hora, min] = match;
          dataFormatada = `${dia}/${mes}/${ano} às ${hora}:${min}`;
        }

        return {
          name: `${dataFormatada} (${Math.round(obj.size / 1024)}KB)`,
          value: obj.id
        };
      });

      await interaction.respond(choices);

    } catch (e) {
      console.log("Erro no autocomplete de arquivos:", e.message);
      await interaction.respond([]);
    }
  }
});