const { GatewayIntentBits } = require('discord.js');
const Discord = require("discord.js");
require('dotenv').config({ path: __dirname + '/.env' });

const { QuickDB } = require('quick.db');
require('colors');

global.db = new QuickDB();

const config = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    redirect_uri: process.env.REDIRECT_URI,
    guild_id: process.env.GUILD_ID
  }
};

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

client.setMaxListeners(100);
client.slashCommands = new Discord.Collection();

require('./handler/slashCommands')(client);
require('./handler/eventsPath')(client);
// require('./handler/onError')(client);
require('./handler/onInteraction')(client);
require('./handler/apiServer')(client);

client.login(config.client.token)