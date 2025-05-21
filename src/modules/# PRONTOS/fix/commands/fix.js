const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const res = require("../../../utils/resTypes"); // usa seu sistema res
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
            return interaction.reply(res.error("Você não tem permissão para isso.", { ephemeral: true }));
        }

        let db = {};
        if (fs.existsSync(filePath)) {
            db = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        switch (acao) {
            case "fixar":
                if (!canal.isTextBased()) {
                    return interaction.reply(res.error("Canal inválido.", { ephemeral: true }));
                }

                if (!msg) {
                    return interaction.reply(res.warning("Você precisa informar a mensagem.", { ephemeral: true }));
                }

                const enviada = await canal.send(msg);

                db[canal.id] = {
                    messageId: enviada.id,
                    content: msg,
                };

                fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

                return interaction.reply(res.success(`Mensagem fixada em ${canal}.`, { ephemeral: true }));

            case "desfixar":
                if (!canal.isTextBased()) {
                    return interaction.reply(res.error("Canal inválido.", { ephemeral: true }));
                }

                if (!db[canal.id]) {
                    return interaction.reply(res.warning("Nenhuma mensagem fixada encontrada nesse canal.", { ephemeral: true }));
                }

                const antiga = await canal.messages.fetch(db[canal.id].messageId).catch(() => null);
                if (antiga) await antiga.delete();

                delete db[canal.id];
                fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

                return interaction.reply(res.success(`Mensagem desfixada de ${canal}.`, { ephemeral: true }));

            case "listar":
                if (Object.keys(db).length === 0) {
                    return interaction.reply(res.info("Nenhuma mensagem fixada encontrada.", { ephemeral: true }));
                }

                const lista = Object.entries(db).map(([id, data]) => {
                    const ch = interaction.guild.channels.cache.get(id);
                    return ch ? `${ch}: "${data.content}"` : null;
                }).filter(Boolean).join("\n");

                return interaction.reply(res.info(lista || "Nada encontrado.", { ephemeral: true }));

            default:
                return interaction.reply(res.error("Ação inválida.", { ephemeral: true }));
        }
    }
};