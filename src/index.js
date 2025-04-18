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

const { checkLiveStatus } = require('./modules/live-monitor/api/oauth2');
const { handleOAuthCallback } = require('./modules/oAuth2/api/callback');

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

app.get('/oauth2/callback', handleOAuthCallback);

app.use('/ticket', express.static(path.join(__dirname, 'ticket')));

app.get('/invite', (req, res) => {
    const clientId = '1163189542845685922';
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
        await interaction.reply({ content: "Ocorreu um erro ao executar o comando.", ephemeral: true });
    }
});


client.slashCommands = new Discord.Collection();
require('./handler/slash')(client);
require('./handler/events')(client);
client.login(cfg.client.token);