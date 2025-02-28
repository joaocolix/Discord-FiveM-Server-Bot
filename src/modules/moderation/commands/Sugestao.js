const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = require('../../../index');

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; 
    if (message.channel.id === "1141551647496081519") {
        await message.channel.send(`**Nova sugestão recebida,** enviada por ${message.author} `);

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(`\`\`\`${message.content}\`\`\``)
            .setFooter({ text: `Vocês está de acordo ou não? Vote abaixo!` });

        const sentMessage = await message.channel.send({ embeds: [embed] });

        try {
            await message.delete();
            await sentMessage.react('1165693011905216684'); // ID do emoji personalizado
            await sentMessage.react('1165693037964431510'); // ID do emoji personalizado
        } catch (error) {
            console.error('Erro ao reagir ou deletar a mensagem:', error);
        }
    }
});