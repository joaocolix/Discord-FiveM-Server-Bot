const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

module.exports = async function sendLog(guild, { title, description, user = null, color = "#ff0000" }) {
    const data = loadAntiLinkData();
    const guildData = data[guild.id];
    if (!guildData?.logChannel) return;

    const logChannel = guild.channels.cache.get(guildData.logChannel);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

    if (user) {
        embed.setFooter({ text: `Ação por: ${user.tag}`, iconURL: user.displayAvatarURL() });
    }

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error("Erro ao enviar log:", err);
    }
};
