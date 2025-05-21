const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/fixedMessages.json");

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild || !message.channel.isTextBased()) return;

    if (!fs.existsSync(filePath)) return;

    const db = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const fixado = db[message.channel.id];
    if (!fixado) return;

    try {
        const antiga = await message.channel.messages.fetch(fixado.messageId).catch(() => null);
        if (antiga) await antiga.delete();

        const nova = await message.channel.send(fixado.content);

        db[message.channel.id].messageId = nova.id;
        fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");
    } catch (err) {
        console.error("Erro ao atualizar mensagem fixada:", err);
    }
});