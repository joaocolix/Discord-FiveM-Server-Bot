const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const client = require('../../../index');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_add_license_')) {
        const data = interaction.customId.split('_');
        const userId = data[3];
        const serverName = data.slice(4).join('_');

        const scriptName = interaction.fields.getTextInputValue('script_name');
        const licenseTime = interaction.fields.getTextInputValue('license_time');

        let licenses = {};
        if (fs.existsSync(licensesPath)) {
            const raw = fs.readFileSync(licensesPath);
            licenses = JSON.parse(raw);
        }

        if (!licenses[userId]) {
            licenses[userId] = [];
        }

        if (!licenses[userId]) {
            licenses[userId] = [];
        }

        const jaExiste = licenses[userId].some(l =>
            l.servidor.toLowerCase() === serverName.toLowerCase() &&
            l.script.toLowerCase() === scriptName.toLowerCase()
        );

        if (jaExiste) {
            return await interaction.reply({
                content: `Este usuário já possui o script **${scriptName}** no servidor **${serverName}**.`,
                ephemeral: true
            });
        }

        licenses[userId].push({
            servidor: serverName,
            script: scriptName,
            tempo: licenseTime,
            ip: `127.0.0.1`,
            criado_em: new Date().toISOString()
        });

        fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 4));

        await interaction.reply({
            content: `Licença adicionada para <@${userId}> no servidor **${serverName}**.`,
            ephemeral: true
        });
    }
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_remove_license_')) {
        const parts = interaction.customId.split('_');
        const userId = parts[3];
        const script = decodeURIComponent(parts[4]);
        const servidor = decodeURIComponent(parts.slice(5).join('_')); // novo
    
        const reason = interaction.fields.getTextInputValue('removal_reason');
    
        let licenses = {};
        if (fs.existsSync(licensesPath)) {
            licenses = JSON.parse(fs.readFileSync(licensesPath));
        }
    
        const originalLength = (licenses[userId] || []).length;
        licenses[userId] = (licenses[userId] || []).filter(l =>
            !(l.script === script && l.servidor === servidor)
        );
        const newLength = licenses[userId].length;
    
        fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 4));
    
        const reply = originalLength === newLength
            ? `Licença **${script}** no servidor **${servidor}** não encontrada para <@${userId}>.`
            : `Licença **${script}** removida de <@${userId}> no servidor **${servidor}**.\n📝 Motivo: ${reason}`;
    
        await interaction.reply({ content: reply, ephemeral: true });
    }
    
    if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_gerenciar_')) {
        const parts = interaction.customId.split('_');
        const campo = parts[2];
        const userId = parts[3];
        const script = decodeURIComponent(parts[4]);
        const servidor = decodeURIComponent(parts[5]);

        const novoValor = interaction.fields.getTextInputValue(`campo_${campo}`);

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

        await interaction.reply({
            content: `O campo **${campo}** da licença foi atualizado com sucesso.`,
            ephemeral: true
        });
    }
});