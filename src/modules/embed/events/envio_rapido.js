const Discord = require('discord.js')
const client = require('../../../index')
const userEmbeds = require("../cache/userEmbeds");

client.on('interactionCreate', async (interaction) => {

    if (interaction.isButton() && interaction.customId === "envio_rapido") {
        const userId = interaction.user.id;
        const embeds = userEmbeds.get(userId);

        if (!embeds || embeds.length === 0) {
            return interaction.reply({ content: "Você ainda não criou nenhuma embed.", flags: 1 << 6 });
        }

        const validEmbeds = embeds.map(e => Discord.EmbedBuilder.from(e));

        try {
            await interaction.channel.send({ embeds: validEmbeds });
            return interaction.reply({
                content: "Embeds enviadas com sucesso neste canal.",
                flags: 1 << 6
            });
        } catch (err) {
            console.error("Erro ao enviar embeds:", err);
            return interaction.reply({
                content: "Ocorreu um erro ao enviar as embeds. Verifique se elas estão válidas.",
                flags: 1 << 6
            });
        }
    }
});