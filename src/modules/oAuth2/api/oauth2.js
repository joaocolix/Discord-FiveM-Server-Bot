const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { addRoleToUser } = require('./role');

const tokenFilePath = path.join(__dirname, '../../../database/json/token.json');
const cfg = require('../../../configs/client.json');

function readTokens() {
    const data = fs.readFileSync(tokenFilePath);
    return JSON.parse(data);
}

function writeTokens(tokens) {
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2));
}

function storeAccessToken(userId, accessToken, refreshToken, expiresIn) {
    const tokens = readTokens();
    tokens[userId] = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiration_time: Date.now() + expiresIn * 1000,
    };
    writeTokens(tokens);
}

async function getAccessToken(userId) {
    return await refreshAccessToken(userId);
}

async function addMemberToServer(userId, serverId, accessToken) {
    try {
        await axios.put(
            `https://discord.com/api/v10/guilds/${serverId}/members/${userId}`,
            { access_token: accessToken },
            {
                headers: {
                    Authorization: `Bot ${cfg.client.token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        await addRoleToUser(serverId, userId);

    } catch (error) {
        console.error(`Erro ao adicionar o usuário ${userId} ao servidor ${serverId}:`, error.response ? error.response.data : error.message);
    }
}

async function refreshAccessToken(userId) {
    const tokens = readTokens();
    const userToken = tokens[userId];

    if (!userToken) return null;

    if (Date.now() < userToken.expiration_time) {
        return userToken.access_token;
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: cfg.client.id,
            client_secret: cfg.client.secret,
            grant_type: 'refresh_token',
            refresh_token: userToken.refresh_token,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        storeAccessToken(userId, access_token, refresh_token, expires_in);
        return access_token;
    } catch (error) {
        console.error(`Erro ao renovar token: ${error.message}`);
        return null;
    }
}

module.exports = {
    storeAccessToken,
    getAccessToken,
    addMemberToServer,
};