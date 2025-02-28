const { GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const Discord = require("discord.js");
const cfg = require("./configs/client.json");
const { QuickDB } = require('quick.db');
global.db = new QuickDB();
require('colors');
const express = require('express');
const path = require('path');
const app = express();

const { checkLiveStatus } = require('./handler/api/twitch');
const { handleOAuthCallback } = require('./handler/api/callback');

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        '32767'
    ]
});
module.exports = client;

client.setMaxListeners(20);

app.get('/error', (req, res) => {
    res.sendFile(path.join(__dirname, 'handler/api/html/error.html'));
});

app.get('/sucess', (req, res) => {
    res.sendFile(path.join(__dirname, 'handler/api/html/sucess.html'));
});

app.get('/oauth2/callback', handleOAuthCallback);

app.use('/ticket', express.static(path.join(__dirname, 'ticket')));

app.get('/invite', (req, res) => {
    const clientId = '1163189542845685922'; // Substitua pelo ID do seu bot
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8`;
    res.redirect(inviteUrl);
});

app.listen(80, () => {
    console.log(`[CARREGADO] API: OAuth2`.green);
});

setInterval(async () => {
    await checkLiveStatus(client);
}, 10000);

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.run(client, interaction);
    } catch (error) {
        console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
        await interaction.reply({ content: "❌ Ocorreu um erro ao executar o comando.", ephemeral: true });
    }
});


client.slashCommands = new Discord.Collection();
require('./handler/slash')(client);
require('./handler/events')(client);
// require('./handler/error')(client);
client.login(cfg.client.token);

// const eventTicketPath = path.join(__dirname, 'eventTicket');

// fs.readdirSync(eventTicketPath).forEach(file => {
//     if (file.endsWith('.js')) { 
//         const event = require(`./eventTicket/${file}`);
//         if (event.execute && typeof event.execute === 'function') {
//             client.on('interactionCreate', event.execute);

//             const eventName = path.basename(file, path.extname(file));
//             console.log(`[CARREGADO] Ticket: ${eventName}`.green);
//         }
//     }
// });