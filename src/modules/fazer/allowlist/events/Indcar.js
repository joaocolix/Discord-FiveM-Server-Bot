const Discord = require('discord.js')
const client = require('../../../index')

const channelID = "1271628478382346240";

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; 

  if (message.channel.id === channelID) {
    message.channel.sendTyping();
    message.reply({ content: 'Opa! faça sua indicação usando o comando `/indicar`' }) 
      .then((reply) => {
        setTimeout(() => {
          message.delete(); 
          reply.delete();
        }, 3000); 
      });
  }
});