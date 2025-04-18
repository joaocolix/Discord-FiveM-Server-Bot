const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const filePath = path.join(__dirname, "../data/fixedMessages.json");

module.exports = {
    name: "desfixar",
    description: "[SETUP] Remove uma mensagem fixada",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Escolha o canal com uma mensagem fixada",
            type: 3, // STRING
            required: true,
            autocomplete: true,
        }
    ],

    run: async (client, interaction) => {
        const canalId = interaction.options.getString("canal");
        const canal = interaction.guild.channels.cache.get(canalId);

        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "Você não tem permissão para usar este comando.", ephemeral: true });
        }

        if (!canal || !canal.isTextBased()) {
            return interaction.reply({ content: "Canal inválido ou não encontrado.", ephemeral: true });
        }

        let db = {};
        if (fs.existsSync(filePath)) {
            db = JSON.parse(fs.readFileSync(filePath, "utf8"));
        }

        const fixado = db[canal.id];
        if (!fixado) {
            return interaction.reply({ content: "Esse canal não possui mensagem fixada.", ephemeral: true });
        }

        try {
            const antiga = await canal.messages.fetch(fixado.messageId).catch(() => null);
            if (antiga) await antiga.delete();
        } catch (err) {
            console.error("Erro ao apagar mensagem fixada:", err);
        }

        delete db[canal.id];
        fs.writeFileSync(filePath, JSON.stringify(db, null, 4), "utf8");

        return interaction.reply({ content: `Mensagem desfixada do canal ${canal}.`, ephemeral: true });
    },

    autocomplete: async (interaction) => {
        try {
            const focusedValue = interaction.options.getFocused();
            const guild = interaction.guild;
    
            console.log("🔍 Autocomplete ativado");
            if (!guild) {
                console.log("❌ Guild inválido");
                return interaction.respond([]);
            }
    
            const filePath = path.join(__dirname, "../../../data/fixedMessages.json");
    
            if (!fs.existsSync(filePath)) {
                console.log("❌ Arquivo JSON não existe");
                return interaction.respond([]);
            }
    
            const db = JSON.parse(fs.readFileSync(filePath, "utf8"));
            console.log("📄 Dados carregados:", db);
    
            const choices = Object.keys(db)
                .map(channelId => guild.channels.cache.get(channelId))
                .filter(channel => channel && channel.isTextBased())
                .filter(channel => channel.name.toLowerCase().includes(focusedValue.toLowerCase()))
                .map(channel => ({
                    name: `#${channel.name}`,
                    value: channel.id
                }));
    
            console.log("✅ Canais encontrados para autocomplete:", choices);
    
            await interaction.respond(choices.slice(0, 25));
        } catch (err) {
            console.error("💥 Erro no autocomplete de /desfixar:", err);
            await interaction.respond([]);
        }
    }
    
};
