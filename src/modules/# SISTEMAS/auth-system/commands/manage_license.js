const { ApplicationCommandOptionType, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const licensesPath = path.join(__dirname, '..', 'data', 'licenses.json');

module.exports = {
    name: 'manage_license',
    description: 'Gerenciar licenças de um usuário',
    options: [
        {
            name: 'usuario',
            description: 'ID do usuário',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],

    run: async (client, interaction) => {
        const userId = interaction.options.getString('usuario');

        let licenses = {};
        if (fs.existsSync(licensesPath)) {
            licenses = JSON.parse(fs.readFileSync(licensesPath));
        }

        const userLicenses = licenses[userId];
        if (!userLicenses || userLicenses.length === 0) {
            return interaction.reply({
                content: `Nenhuma licença encontrada para o ID informado.`,
                flags: 1 << 6
            });
        }

        const servidores = [...new Set(userLicenses.map(l => l.servidor))];

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`select_server_${userId}`)
            .setPlaceholder('Escolha um servidor')
            .addOptions(
                servidores.map(s => ({
                    label: s,
                    value: s
                }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            content: `Escolha o servidor que deseja gerenciar para <@${userId}>:`,
            components: [row],
            flags: 1 << 6
        });
    }
};
