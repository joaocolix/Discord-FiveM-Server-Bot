require('dotenv').config({ path: __dirname + '/../.env' });

module.exports = {
  client: {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    token: process.env.DISCORD_TOKEN,
    redirect_uri: process.env.REDIRECT_URI,
    guild_id: process.env.GUILD_ID
  },
  webhookUrl: process.env.WEBHOOK_URL,
};