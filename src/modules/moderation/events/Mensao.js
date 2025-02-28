const Discord = require('discord.js');
const client = require('../../../index')

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let mencoes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
  mencoes.forEach(async (element) => {
    if (message.content.includes(element)) {

      await message.channel.sendTyping();

      let resposta = "Opa! Me chamou?";
      message.reply(resposta);
    }
  });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let mencoes = [`Quem criou a logo da cidade?`];
  mencoes.forEach(async (element) => {
    if (message.content.includes(element)) {

      await message.channel.sendTyping();

      let resposta = "depois de muita luta, encontramos o Filsk Visuals e assim demos inicio a uma jornada de 5 horas para a criação de nossa identidade visual.";
      message.reply(resposta);
    }
  });
});