const express = require('express');
const path = require('path');
const { checkLiveStatus } = require('../modules/live-monitor/api/oauth2');
const { handleOAuthCallback } = require('../modules/oAuth2/api/callback');
require("dotenv").config();

module.exports = (client) => {
    const app = express();

    app.get('/oauth2/callback', handleOAuthCallback);
    app.use('/ticket', express.static(path.join(__dirname, '../ticket')));

    app.get('/invite', (req, res) => {
        const clientId = `${process.env.CLIENT_ID}`;
        const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8`;
        res.redirect(inviteUrl);
    });

    app.listen(80, () => {
        console.log(`[CARREGADO] API: OAuth2`.green);
    });

    setInterval(async () => {
        await checkLiveStatus(client);
    }, 10000);
};
