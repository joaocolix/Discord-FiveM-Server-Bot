const axios = require("axios");
const cfg = require("../../../configs/client.json");

const ROLE_ID = "1348399288849272953";

async function addRoleToUser(guildId, userId) {
    try {
        await axios.put(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${ROLE_ID}`,
            {},
            {
                headers: {
                    Authorization: `Bot ${cfg.client.token}`,
                },
            }
        );
        console.log(`Cargo ${ROLE_ID} adicionado ao usuário ${userId} no servidor ${guildId}.`);
    } catch (error) {
        console.error(`Erro ao adicionar cargo ao usuário ${userId}:`, error.response ? error.response.data : error.message);
    }
}

module.exports = {
    addRoleToUser
};