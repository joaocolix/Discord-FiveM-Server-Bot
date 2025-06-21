const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
if (interaction.isButton() && interaction.customId === "add_embed") {
            await interaction.deferUpdate();
        
            const userId = interaction.user.id;
            const embeds = userEmbeds.get(userId) || [];
            const novaEmbed = new Discord.EmbedBuilder()
                .setDescription("Nova embed criada!")
                .setColor("#2f3136");
        
            embeds.push(novaEmbed);
            userEmbeds.set(userId, embeds);
        
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
        
            await interaction.editReply({
                embeds: embeds,
                components: [rowMenu, rowBotoes]
            });
        }       
});