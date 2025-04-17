const Discord = require("discord.js");
const userEmbeds = require("../cache/userEmbeds");

module.exports = {
    name: "criar-embed",
    description: "Criar e gerenciar embeds de forma interativa",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        const userId = interaction.user.id;

        const novaEmbed = new Discord.EmbedBuilder()
            .setDescription("Nova embed criada!")
            .setColor("#2f3136");

        userEmbeds.set(userId, [novaEmbed]);

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("editar_embed_select")
            .setPlaceholder("Selecione a embed para editar")
            .addOptions([
                {
                    label: "Embed 1",
                    value: "embed_0"
                }
            ]);

        const rowMenu = new Discord.ActionRowBuilder().addComponents(selectMenu);

        const rowBotoes = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("add_embed")
                .setLabel("Adicionar Embed")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setCustomId("add_button")
                .setLabel("Adicionar Botão")
                .setStyle(Discord.ButtonStyle.Primary),

            new Discord.ButtonBuilder()
                .setCustomId("enviar_personalizado")
                .setLabel("Enviar Personalizado")
                .setStyle(Discord.ButtonStyle.Success),

            new Discord.ButtonBuilder()
                .setCustomId("envio_rapido")
                .setLabel("Envio Rápido")
                .setStyle(Discord.ButtonStyle.Danger)
        );

        await interaction.reply({
            ephemeral: true,
            embeds: [novaEmbed],
            components: [rowMenu, rowBotoes]
        });
    }
};