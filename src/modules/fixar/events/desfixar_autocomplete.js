const fs = require("fs");
const path = require("path");
const client = require("../../../index"); // ajuste o caminho se necessário
const filePath = path.join(__dirname, "..", "data", "fixedMessages.json");

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    if (interaction.commandName !== "desfixar") return;

    const focused = interaction.options.getFocused(true);

    if (focused.name !== "canal") return;

    try {
        const guild = interaction.guild;
        if (!guild || !fs.existsSync(filePath)) {
            return interaction.respond([]);
        }

        const db = JSON.parse(fs.readFileSync(filePath, "utf8"));

        const suggestions = Object.keys(db)
            .map(id => guild.channels.cache.get(id))
            .filter(c => c && c.isTextBased())
            .filter(c => c.name.toLowerCase().includes(focused.value.toLowerCase()))
            .map(c => ({
                name: `#${c.name}`,
                value: c.id
            }))
            .slice(0, 25);

        await interaction.respond(suggestions);
    } catch (err) {
        console.error("Erro no autocomplete do /desfixar:", err);
        await interaction.respond([
            {
                name: "Erro ao carregar sugestões",
                value: "erro_autocomplete"
            }
        ]);
    }
});
