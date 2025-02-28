const axios = require('axios');
const path = require('path');
const { storeAccessToken, addRoleToUser } = require('./oauth2');
const cfg = require('../../configs/client.json');

async function handleOAuthCallback(req, res) {
    const code = req.query.code;

    if (!code) {
        res.sendFile(path.join(__dirname, 'html/error.html'));
    }

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: cfg.client.id,
            client_secret: cfg.client.secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: cfg.client.redirect_uri,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = tokenResponse.data;

        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userId = userResponse.data.id;

        storeAccessToken(userId, access_token);

        const rolesToAdd = ['1140886455439343648', '1271576799012458526'];
      
        for (const roleId of rolesToAdd) {
            await addRoleToUser('1140469447866470530', userId, roleId);
        }

        res.sendFile(path.join(__dirname, 'html/sucess.html'));

    } catch (error) {
        res.sendFile(path.join(__dirname, 'html/error.html'));
    }
}

module.exports = {
    handleOAuthCallback,
};
