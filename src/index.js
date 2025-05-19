require('colors');
const { QuickDB } = require('quick.db');
global.db = new QuickDB();

const config = require('./core/loadConfig');
const client = require('./core/loadClient');
require('./core/loadHandlers')(client);

client.once('ready', () => {
  console.log(`[ONLINE] Bot conectado como ${client.user.tag}`.green);
});

client.login(config.client.token);
module.exports = client;