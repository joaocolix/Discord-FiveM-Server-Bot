const Discord = require('discord.js')
const client = require('../../../index')
const { checkLiveStatus } = require('./../api/oauth2');

client.on("ready", async () => {
    await checkLiveStatus(client);

    setInterval(() => {
        checkLiveStatus(client);
    }, 60000);

});
