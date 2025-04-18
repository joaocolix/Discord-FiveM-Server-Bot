const { GatewayIntentBits } = require('discord.js');
const Discord = require("discord.js");
const cfg = require("./configs/client.json");
const { QuickDB } = require('quick.db');
require('colors');

global.db = new QuickDB();

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

client.slashCommands = new Discord.Collection();
require('./handler/slashCommands')(client);
require('./handler/eventsPath')(client);
require('./handler/onError')(client);
require('./handler/onInteraction')(client);
require('./handler/apiServer')(client);
client.login(cfg.client.token);