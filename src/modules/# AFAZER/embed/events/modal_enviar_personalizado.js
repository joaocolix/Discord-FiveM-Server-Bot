const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId === "modal_enviar_personalizado") {
        const webhookURL = interaction.fields.getTextInputValue("webhook");
        const nome = interaction.fields.getTextInputValue("nome") || null;
        const avatar = interaction.fields.getTextInputValue("avatar") || null;
    
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);
    
        if (!embeds || embeds.length === 0) {
            return interaction.reply({
                flags: 1 << 6,
                content: "Nenhuma embed foi criada para enviar."
            });
        }
    
        try {
            const res = await fetch(webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: nome || undefined,
                    avatar_url: avatar || undefined,
                    embeds: embeds.map(e => Discord.EmbedBuilder.from(e).toJSON())
                })
            });
    
            if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    
            await interaction.reply({
                flags: 1 << 6,
                content: "Embeds enviadas com sucesso via Webhook!"
            });
        } catch (err) {
            console.error("[Webhook Error]", err);
            await interaction.reply({
                flags: 1 << 6,
                content: "Ocorreu um erro ao enviar via webhook. Verifique a URL e tente novamente."
            });
        }
    }    
});