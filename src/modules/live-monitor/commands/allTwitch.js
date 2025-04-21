const Discord = require("discord.js");
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: "twitch",
    description: "[FERRAMENTAS] Comandos para monitorar streams na Twitch",
    type: 1,
    options: [
        {
            name: 'action',
            description: 'Ação a ser realizada: adicionar, remover ou listar',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Adicionar', value: 'add' },
                { name: 'Remover', value: 'remove' },
                { name: 'Listar', value: 'list' }
            ]
        },
        {
            name: 'twitch_username',
            description: 'Nome de usuário da Twitch para adicionar ou remover',
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'discord_user',
            description: 'Mencione o usuário do Discord ou forneça o ID do usuário',
            type: Discord.ApplicationCommandOptionType.User,
            required: false,
        }
    ],
    permissions: {},
    run: async (client, interaction) => {
        const action = interaction.options.getString("action");
        const twitchUsername = interaction.options.getString("twitch_username");
        const discordUser = interaction.options.getUser("discord_user");

        if (action === 'add') {
            if (!twitchUsername || !discordUser) {
                return interaction.reply({
                    content: `Por favor, forneça um nome de usuário da Twitch e o usuário do Discord para adicionar.`,
                    flags: 1 << 6
                });
            }

            let users = await db.get('twitchUsers') || [];

            if (users.find(user => user.username === twitchUsername)) {
                return interaction.reply({
                    content: `Esse usuário já está cadastrado.`,
                    flags: 1 << 6
                });
            }

            users.push({ username: twitchUsername, discordId: discordUser.id, live: false });
            await db.set('twitchUsers', users);

            interaction.reply({
                content: `Usuário **${twitchUsername}** foi cadastrado para monitoramento.`,
                flags: 1 << 6
            });

        } else if (action === 'remove') {
            if (!twitchUsername) {
                return interaction.reply({
                    content: `Por favor, forneça um nome de usuário da Twitch para remover.`,
                    flags: 1 << 6
                });
            }

            let users = await db.get('twitchUsers') || [];

            if (!users.find(user => user.username === twitchUsername)) {
                return interaction.reply({
                    content: `Esse usuário não está cadastrado.`,
                    flags: 1 << 6
                });
            }

            users = users.filter(user => user.username !== twitchUsername);
            await db.set('twitchUsers', users);

            interaction.reply({
                content: `Usuário **${twitchUsername}** foi removido do monitoramento.`,
                flags: 1 << 6
            });

        } else if (action === 'list') {
            const users = await db.get('twitchUsers') || [];
            if (users.length === 0) {
                return interaction.reply({
                    content: `Não há usuários cadastrados para monitoramento.`,
                    flags: 1 << 6
                });
            }

            const userList = users.map(user => `https://www.twitch.tv/${user.username} (Discord ID: ${user.discordId})`).join('\n');
            interaction.reply({
                content: `Usuários cadastrados:\n${userList}`,
                flags: 1 << 6
            });
        }
    }
};