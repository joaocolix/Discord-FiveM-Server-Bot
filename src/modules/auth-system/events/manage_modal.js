const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('modal_edit|')) {
        const [_, campo, userId, scriptRaw, servidorRaw] = interaction.customId.split('|');
        const script = decodeURIComponent(scriptRaw);
        const servidor = decodeURIComponent(servidorRaw);
        const novoValor = interaction.fields.getTextInputValue('campo_valor');

        let licenses = {};
        if (fs.existsSync(licensesPath)) {
            licenses = JSON.parse(fs.readFileSync(licensesPath));
        }

        const userLicenses = licenses[userId] || [];
        const licenca = userLicenses.find(l =>
            l.script === script && l.servidor === servidor
        );

        if (!licenca) {
            return await interaction.reply({ content: 'Licença não encontrada.', ephemeral: true });
        }

        licenca[campo] = novoValor;

        fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 4));

        return await interaction.reply({
            content: `O campo **${campo}** da licença foi atualizado com sucesso para **${novoValor}**.`,
            ephemeral: true
        });
    }
});
