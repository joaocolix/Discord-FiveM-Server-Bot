const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId.startsWith("modal_title_")) {
        const index = parseInt(interaction.customId.split("_")[2]);
        const titulo = interaction.fields.getTextInputValue("titulo");
        const url = interaction.fields.getTextInputValue("url") || null;
    
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);
        if (!embeds || !embeds[index]) return;
    
        const embed = embeds[index];
        embed.setTitle(titulo);
        if (url) embed.setURL(url);
    
        await interaction.deferUpdate();
    
        await interaction.editReply({
            embeds: [embed],
            components: [
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder().setCustomId(`edit_title_${index}`).setLabel("Título").setStyle(1),
                    new Discord.ButtonBuilder().setCustomId(`edit_description_${index}`).setLabel("Descrição").setStyle(1),
                    new Discord.ButtonBuilder().setCustomId(`edit_color_${index}`).setLabel("Cor").setStyle(1),
                    new Discord.ButtonBuilder().setCustomId(`edit_author_${index}`).setLabel("Autor").setStyle(1),
                    new Discord.ButtonBuilder().setCustomId(`edit_image_${index}`).setLabel("Imagem/Thumb").setStyle(1)
                ),
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder().setCustomId(`edit_footer_${index}`).setLabel("Rodapé").setStyle(1),
                    new Discord.ButtonBuilder().setCustomId(`import_json_${index}`).setLabel("Importar JSON").setStyle(2),
                    new Discord.ButtonBuilder().setCustomId(`export_json_${index}`).setLabel("Exportar JSON").setStyle(2),
                    new Discord.ButtonBuilder().setCustomId("voltar_menu").setLabel("Voltar").setStyle(3),
                    new Discord.ButtonBuilder().setCustomId(`apagar_embed_${index}`).setLabel("Apagar").setStyle(4)
                )
            ]
        });
    }    
});