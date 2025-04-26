const Discord = require("discord.js");
const client = require('../../../index');

client.on("interactionCreate", async interaction => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "selecionar_notificacao") return;

    const fs = require("fs");
    const path = require("path");

    const notificacao = interaction.values[0];

    const canalSelect = new Discord.ChannelSelectMenuBuilder()
        .setCustomId(`selecionar_canal_${notificacao}`)
        .setPlaceholder("Escolha o canal para anunciar a notificação")
        .setChannelTypes(Discord.ChannelType.GuildText);

    const row = new Discord.ActionRowBuilder().addComponents(canalSelect);

    await interaction.update({
        content: `Agora selecione o canal onde **${notificacao}** será anunciado:`,
        components: [row]
    });
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChannelSelectMenu()) return;
    if (!interaction.customId.startsWith("selecionar_canal_")) return;

    const fs = require("fs");
    const path = require("path");

    const notificacao = interaction.customId.replace("selecionar_canal_", "");
    const canalId = interaction.values[0];
    const guildId = interaction.guild.id;

    const filePath = path.resolve(__dirname, "../data/canais.json");
    let data = {};

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    if (!data[guildId]) data[guildId] = {};

    data[guildId][notificacao] = canalId;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));

    await interaction.update({
        content: `✅ Notificação **${notificacao}** será enviada no canal <#${canalId}>!`,
        components: []
    });
});
