const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === "modal_add_button") {
        const texto = interaction.fields.getTextInputValue("texto");
        const url = interaction.fields.getTextInputValue("url");
        const emoji = interaction.fields.getTextInputValue("emoji") || null;
    
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);
    
        if (!embeds || embeds.length === 0) {
            return interaction.reply({
                ephemeral: true,
                content: "Nenhuma embed criada ainda."
            });
        }
    
        const embed = embeds[embeds.length - 1]; 
    
        const button = new Discord.ButtonBuilder()
            .setLabel(texto)
            .setStyle(url ? Discord.ButtonStyle.Link : Discord.ButtonStyle.Primary);
    
        if (url) button.setURL(url);
        else button.setCustomId(`custom_button_${Date.now()}`);
    
        if (emoji) button.setEmoji(emoji);
    
        const row = new Discord.ActionRowBuilder().addComponents(button);
    
        await interaction.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        });
    }     
});