const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const filePath = path.join(__dirname, "../data/fixedMessages.json");

module.exports = {
    name: "fix",
    description: "[SETUP] Gerencia mensagens fixadas nos canais",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "ação",
            type: 3,
            description: "O que deseja fazer?",
            required: true,
            choices: [
                { name: "Fixar", value: "fixar" },
                { name: "Desfixar", value: "desfixar" },
                { name: "Listar", value: "listar" },
            ]
        },
        {
            name: "mensagem",
            type: 3,
            description: "Mensagem a ser fixada",
            required: false,
        },
        {
            name: "canal",
            type: 7,
            description: "Canal de texto",
            required: false,
        }
    ],

    run: async (client, interaction) => {
        const acao = interaction.options.getString("ação");
        const canal = interaction.options.getChannel("canal") || interaction.channel;
        const msg = interaction.options.getString("mensagem");

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Você não tem permissão para isso.", flags: 1 << 6 });
        }

        let db = {};
        if (fs.existsSync(filePath)) {
            db = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        switch (acao) {
            case "fixar":
                if (!canal.isTextBased()) return interaction.reply({ content: "Canal inválido.", flags: 1 << 6 });
                if (!msg) return interaction.reply({ content: "Você precisa informar a mensagem.", flags: 1 << 6 });

                const enviada = await canal.send(msg);

                db[canal.id] = {
                    messageId: enviada.id,
                    content: msg,
                };

                fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

                return interaction.reply({ content: `Mensagem fixada em ${canal}.`, flags: 1 << 6 });

            case "desfixar":
                if (!canal.isTextBased()) return interaction.reply({ content: "Canal inválido.", flags: 1 << 6 });

                if (!db[canal.id]) {
                    return interaction.reply({ content: "Nenhuma mensagem fixada encontrada nesse canal.", flags: 1 << 6 });
                }

                const antiga = await canal.messages.fetch(db[canal.id].messageId).catch(() => null);
                if (antiga) await antiga.delete();

                delete db[canal.id];
                fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

                return interaction.reply({ content: `Mensagem desfixada de ${canal}.`, flags: 1 << 6 });

            case "listar":
                if (Object.keys(db).length === 0) {
                    return interaction.reply({ content: "Nenhuma mensagem fixada encontrada.", flags: 1 << 6 });
                }

                const lista = Object.entries(db).map(([id, data]) => {
                    const ch = interaction.guild.channels.cache.get(id);
                    return ch ? `${ch}: "${data.content}"` : null;
                }).filter(Boolean).join("\n");

                return interaction.reply({ content: lista || "Nada encontrado.", flags: 1 << 6 });

            default:
                return interaction.reply({ content: "Ação inválida.", flags: 1 << 6 });
        }
    }
};