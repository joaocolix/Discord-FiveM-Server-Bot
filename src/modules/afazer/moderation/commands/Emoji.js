const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits, parseEmoji, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
    name: "emoji",
    description: "emojis",
    options: [
        {
            name: "add",
            description: "Add um emoji ao server.",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Selecione o emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "name",
                    description: "Escreva qual será o nome do emoji",
                    type: ApplicationCommandOptionType.String,
                    required: false,
                }
            ],
        }, {
            name: "info",
            description: "Veja informações sobre o emoji",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "emoji",
                    description: "Selecione o emoji",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ],
        }
    ],
    run: async(client, interaction) => {

        switch (interaction.options.getSubcommand()) {

            case "add": {

                if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true  })
                }
                if (!interaction.channel.permissionsFor(interaction.user).has(PermissionFlagsBits.ManageEmojisAndStickers)) {
                    return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true  })
                }
                
                let name = interaction.options.getString("name");
                const string = interaction.options.getString("emoji");
    
        
                const parsed = parseEmoji(string);
        
                const link = `https://cdn.discordapp.com/emojis/${parsed.id}${parsed.animated ? '.gif' : '.png'}`;

                if (!name) name = parsed.name;

                interaction.guild.emojis
                    .create({ attachment: link, name: `${name}` })
                    .then((em) => {
                        interaction.reply({ content: `${em} **|** ${interaction.user} Feito!` })
                    })
                    .catch((error) => {
                        console.log(error)
                        return interaction.reply({
                            content: "Não foi possível adicionar emoji, verifique se você atingiu o limite de emojis no servidor\n> Lembre-se, você só pode adicionar emojis personalizados",
                            ephemeral: true,
                        });
                    });

                break;
            } case "info": {

                const emote = interaction.options.getString('emoji');
                const regex = emote.replace(/^<a?:\w+:(\d+)>$/, '$1');

                const emoji = interaction.guild.emojis.cache.find((emj) => emj.id === regex);
                if (!emoji) {
                    const embed1 = new EmbedBuilder()
                        .setDescription('Please enter a valid custum emoji from this server.')
                        .setColor("#765cf5")

                    return interaction.reply({
                        embeds: [embed1],
                        ephemeral: true,
                    });
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Abrir no navegador')
                        .setURL(`https://cdn.discordapp.com/emojis/${emoji.id}${emoji.animated ? '.gif' : '.png'}`)
                        .setStyle(ButtonStyle.Link),
                );

                const embed2 = new EmbedBuilder()
                    .setTitle(`${emoji} Sobre o emoji`)
                    .setColor("#765cf5")
                    .setThumbnail(emoji.url)
                    .addFields(
                    {
                        name: 'ID:',
                        value: `\`\`\`${emoji.id}\`\`\``,
                        inline: false,
                    },
                    {
                        name: 'Menção:',
                        value: emoji.animated ? `\`\`\`<a:${emoji.name}:${emoji.id}>\`\`\`` : `\`\`\`<:${emoji.name}:${emoji.id}>\`\`\``,
                        inline: false,
                    },
                    {
                        name: 'Criado em:',
                        value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:f>`,
                        inline: false,
                    },
                    {
                        name: 'Tipo:',
                        value: `${emoji.animated ? 'Gif' : ' Imagem'}`,
                        inline: false,
                    },
                );

                    interaction.reply({
                        embeds: [embed2],
                        components: [row],
                    });

                break;
            }

        }

    }
}