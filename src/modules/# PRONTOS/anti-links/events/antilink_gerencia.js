const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const sendLog = require("./antilink_send_logs");
const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");
const res = require('../../../utils/resTypes');

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const data = loadAntiLinkData();
    const guildData = data[message.guild.id];
    if (!guildData) return;

    if (!message.member) return;

    const isProtectedChannel = guildData.channels.includes(message.channel.id);
    const isAllowedRole = message.member.roles.cache.some(role => guildData.allowedRoles.includes(role.id));

    if (!isProtectedChannel || isAllowedRole) return;

    const linkRegex = /(https?:\/\/[^\s]+)/gi;
    const linksEncontrados = message.content.match(linkRegex) || [];

    const isLinkPermitido = linksEncontrados.some(link =>
        guildData.allowedLinks?.some(permitido => link.includes(permitido))
    );

    if (linksEncontrados.length && !isLinkPermitido) {
        const mode = guildData.mode || "default";
    
        try {
            const logInfo = {
                title: "",
                description: `**Usuário:** ${message.author}\n**Canal:** <#${message.channel.id}>\n**Mensagem:**\n\`\`\`${message.content}\`\`\``,
                user: message.author,
                color: ""
            };
    
            if (mode === "silent") {
                await message.delete();
                logInfo.title = "Link removido (modo silencioso)";
                logInfo.color = "#999999";
                await sendLog(message.guild, logInfo);
                return;
            }
    
            if (mode === "log_only") {
                logInfo.title = "Link detectado (modo apenas log)";
                logInfo.color = "#ffaa00";
                await sendLog(message.guild, logInfo);
                return;
            }
    
            if (mode === "warn") {
                await message.channel.send({
                    ...res.warning(`${message.author}, cuidado: links não são permitidos aqui.`, {
                        allowedMentions: { users: [message.author.id] }
                    })
                });
                logInfo.title = "Advertência enviada";
                logInfo.color = "#ffcc00";
                await sendLog(message.guild, logInfo);
                return;
            }
    
            await message.delete();
            await message.channel.send({
                ...res.error(`${message.author}, links não são permitidos aqui.`, {
                    allowedMentions: { users: [message.author.id] }
                })
            });
            logInfo.title = "Link bloqueado (modo padrão)";
            logInfo.color = "#ff0000";
            await sendLog(message.guild, logInfo);
    
        } catch (err) {
            console.error(`Erro ao processar link de ${message.author.tag}:`, err);
            await message.channel.send({
                ...res.error(`Não consegui processar a mensagem de ${message.author}. Verifique as permissões.`, {
                    allowedMentions: { users: [] }
                })
            });
        }
    }    
});