const axios = require('axios');
const path = require('path');
const { storeAccessToken, addMemberToServer } = require('./oauth2');
const { sendLogMessage } = require('./logs');
require('dotenv').config();

async function getUserIp(req) {
    let ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    if (ip === '::1' || ip === '127.0.0.1') {
        try {
            const response = await axios.get('https://api64.ipify.org?format=json');
            ip = response.data.ip;
        } catch (error) {
            console.error('Erro ao obter IP externo:', error.message);
            ip = 'Não disponível';
        }
    }

    return ip;
}

async function handleOAuthCallback(req, res) {
    const code = req.query.code;

    if (!code) {
        return res.redirect('https://ape-tools.squareweb.app/error/');
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.REDIRECT_URI,
            scope: 'identify email guilds.join',
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userId = userResponse.data.id;
        const username = userResponse.data.username;
        const email = userResponse.data.email || "Não disponível";

        const ip = await getUserIp(req);
        const data = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

        storeAccessToken(userId, access_token, refresh_token, expires_in);

        await sendLogMessage(userId, username, email, ip, data);

        await addMemberToServer(userId, process.env.GUILD_ID, access_token);

        res.redirect('https://ape-tools.squareweb.app/sucess/');
    } catch (error) {
        console.error("Erro no processo de verificação:", error.message);
        res.redirect('https://ape-tools.squareweb.app/error/');
    }
}

module.exports = {
    handleOAuthCallback,
};