const Discord = require('discord.js');
const { getCaptchaConfig } = require('../events/captcha_config_menu');

module.exports = {
    name: 'captcha',
    description: 'Configure o sistema de captcha',
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'Sem permissão!', ephemeral: true });
        }

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('captcha_config_menu')
            .setPlaceholder('Escolha o que deseja configurar')
            .addOptions([
                { label: 'Canal de verificação', value: 'canal' },
                { label: 'Cargos a adicionar', value: 'add_roles' },
                { label: 'Cargos a remover', value: 'remove_roles' },
                { label: 'Resetar configurações', value: 'reset' }
            ]);

        const row = new Discord.ActionRowBuilder().addComponents(menu);
        await interaction.reply({components: [row], ephemeral: true });
    }
};