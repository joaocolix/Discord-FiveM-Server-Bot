const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (interaction.commandName === 'remove_license') {
        const focused = interaction.options.getFocused(true);

        if (focused.name !== 'script') return;

        const userId = interaction.options.getString('usuario');
        console.log(">>> Autocomplete: usuario =", userId);

        if (!userId || !/^\d{17,20}$/.test(userId)) {
            return interaction.respond([
                { name: 'Digite o ID do usuário primeiro', value: 'invalido' }
            ]);
        }

        const fs = require('fs');
        const path = require('path');
        const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

        let licenses = {};
        if (fs.existsSync(licensesPath)) {
            licenses = JSON.parse(fs.readFileSync(licensesPath));
        }

        const userLicenses = licenses[userId] || [];

        const filtered = userLicenses
        .filter(l => l.script.toLowerCase().includes(focused.value.toLowerCase()))
        .slice(0, 25)
        .map(l => ({
            name: `${l.script} (${l.servidor})`,
            value: l.script
        }));
    

        if (filtered.length === 0) {
            filtered.push({ name: "Nenhum script encontrado", value: "vazio" });
        }

        return interaction.respond(filtered);
    }
});
