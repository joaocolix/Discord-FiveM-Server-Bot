const Discord = require('discord.js')
const client = require('../../../../index')
const axios = require('axios');

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'resolve_pendencia') {
        const message = interaction.message;
        const originalEmbed = Discord.EmbedBuilder.from(message.embeds[0]);
        const components = message.components;
        const resolver = interaction.user;
        const resolvedText = `\n**Quem resolveu:** ${resolver}`;

        const updatedEmbed = originalEmbed
            .setTitle('**PENDÊNCIA RESOLVIDA ✅**')
            .setDescription(`${originalEmbed.data.description}${resolvedText}`)
            .setColor('#2b2d31');

        const resolveButton = new Discord.ButtonBuilder()
            .setLabel('Resolvida')
            .setStyle(Discord.ButtonStyle.Success)
            .setCustomId('resolve_pendencia')
            .setDisabled(true); 

        const linkButton = components[0].components.find(comp => comp.data.url);
        const row = new Discord.ActionRowBuilder().addComponents(linkButton, resolveButton);
        await interaction.update({ embeds: [updatedEmbed], components: [row] });
    }
});