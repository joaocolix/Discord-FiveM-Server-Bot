const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("export_json_")) {
        const index = parseInt(interaction.customId.split("_")[2]);
    
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);
        if (!embeds || !embeds[index]) {
            return interaction.reply({
                flags: 1 << 6,
                content: "Embed não encontrada para exportar."
            });
        }
    
        const embed = embeds[index];
        const jsonExport = JSON.stringify(embed.toJSON(), null, 2);
    
        await interaction.reply({
            flags: 1 << 6,
            content: `**JSON da Embed ${index + 1}:**\n\`\`\`json\n${jsonExport}\n\`\`\``
        });
    }    
});