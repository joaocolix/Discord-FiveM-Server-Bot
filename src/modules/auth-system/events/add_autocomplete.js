const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isAutocomplete()) return;

    if (interaction.commandName === 'add_license') {
        const focused = interaction.options.getFocused(true);

        if (focused.name !== 'servidor') return;

        try {
            let licenses = {};
            if (fs.existsSync(licensesPath)) {
                licenses = JSON.parse(fs.readFileSync(licensesPath));
            }

            const allServers = new Set();
            Object.values(licenses).forEach(userLicenses => {
                if (Array.isArray(userLicenses)) {
                    userLicenses.forEach(entry => {
                        if (entry.servidor) allServers.add(entry.servidor);
                    });
                }
            });

            const servidores = [...allServers];

            let filtered = servidores
                .filter(srv => srv.toLowerCase().includes(focused.value.toLowerCase()))
                .slice(0, 25)
                .map(srv => ({ name: srv, value: srv }));

            if (filtered.length === 0 && focused.value.trim() !== '') {
                filtered.push({
                    name: `Criar novo servidor: "${focused.value}"`,
                    value: focused.value
                });
            }

            await interaction.respond(filtered);
        } catch (err) {
            console.error('Erro no autocomplete:', err);
            await interaction.respond([
                {
                    name: 'Erro ao carregar sugestões',
                    value: 'erro_autocomplete'
                }
            ]);
        }
    }
});
