const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const filePath = path.join(__dirname, "../data/fixedMessages.json");

module.exports = {
    name: "fixar",
    description: "[SETUP] Fixa uma mensagem em um canal",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "mensagem",
            type: 3,
            description: "Mensagem a ser fixada",
            required: true,
        },
        {
            name: "canal",
            type: 7, 
            description: "Canal onde a mensagem será fixada",
            required: false,
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Você não tem permissão para usar este comando.", ephemeral: true });
        }

        const msg = interaction.options.getString("mensagem");
        const canal = interaction.options.getChannel("canal") || interaction.channel;

        if (!canal.isTextBased()) {
            return interaction.reply({ content: "O canal escolhido não é um canal de texto válido.", ephemeral: true });
        }

        const enviada = await canal.send(msg);

        let db = {};
        if (fs.existsSync(filePath)) {
            db = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        db[canal.id] = {
            messageId: enviada.id,
            content: msg,
        };

        fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

        return interaction.reply({ content: `Mensagem fixada com sucesso no canal ${canal}.`, ephemeral: true });
    }
};