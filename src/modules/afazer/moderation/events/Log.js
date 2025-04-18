const client = require('../../../index')
const Discord = require('discord.js')

const webhookUrl = "https://discord.com/api/webhooks/1282093505744867328/JRGuXg8yfy-Ehuo7ArZTNxIKkAiVka6kv5tnDqBEQ6w6bJbP97Tj5lkBWLPEvmC2XBbZ";
const webhookClient = new Discord.WebhookClient({ url: webhookUrl });

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const args = interaction.options._hoistedOptions.map((option) => {
    return `${option.name}: ${option.value}`;
  });

  let logMessage = new Discord.EmbedBuilder()
  .setColor("#2b2d31")
  .setDescription(`
Comando: /${interaction.commandName}
Usuario: ${interaction.user.tag}
ID: ${interaction.user.id}
Servidor: ${interaction.guild.name}`)

  webhookClient.send({ embeds: [logMessage] });
});