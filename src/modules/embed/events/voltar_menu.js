const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === "voltar_menu") {
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);
    
        if (!embeds || embeds.length === 0) {
            return interaction.reply({
                flags: 1 << 6,
                content: "Você ainda não criou nenhuma embed."
            });
        }
    
        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("editar_embed_select")
            .setPlaceholder("Selecione a embed para editar")
            .addOptions(embeds.map((_, i) => ({
                label: `Embed ${i + 1}`,
                value: `embed_${i}`
            })));
    
        const rowMenu = new Discord.ActionRowBuilder().addComponents(selectMenu);
    
        const rowBotoes = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder().setCustomId("add_embed").setLabel("Adicionar Embed").setStyle(2),
            new Discord.ButtonBuilder().setCustomId("add_button").setLabel("Adicionar Botão").setStyle(1),
            new Discord.ButtonBuilder().setCustomId("enviar_personalizado").setLabel("Enviar Personalizado").setStyle(3),
            new Discord.ButtonBuilder().setCustomId("envio_rapido").setLabel("Envio Rápido").setStyle(4)
        );
    
        await interaction.update({
            embeds: embeds,
            components: [rowMenu, rowBotoes]
        });
    }    
});