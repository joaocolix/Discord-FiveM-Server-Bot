const fs = require('fs');
const axios = require('axios');
const path = require('path');

const tokenFilePath = path.join(__dirname, '../../database/json/token.json');
const cfg = require('../../configs/client.json');

function readTokens() {
    const data = fs.readFileSync(tokenFilePath);
    return JSON.parse(data);
}

function writeTokens(tokens) {
    fs.writeFileSync(tokenFilePath, JSON.stringify(tokens, null, 2));
}

function storeAccessToken(userId, accessToken) {
    const tokens = readTokens();
    tokens[userId] = accessToken;
    writeTokens(tokens);
}

function getAccessToken(userId) {
    const tokens = readTokens();
    return tokens[userId];
}

async function addRoleToUser(guildId, userId, roleId) {
    try {
        await axios.put(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`,
            {},
            {
                headers: {
                    Authorization: `Bot ${cfg.client.token}`,
                },
            }
        );
    } catch (error) {
        console.error(`Erro ao adicionar cargo: ${error.message}`);
    }
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
    } catch (error) {
        console.error(`Erro ao adicionar o usuário ${userId} ao servidor ${serverId}:`, error.response ? error.response.data : error.message);
    }
}

module.exports = {
    storeAccessToken,
    getAccessToken,
    addRoleToUser,
    addMemberToServer,
};
