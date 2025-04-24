const Discord = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    name: 'ping-equipe',
    description: '[FERRAMENTA] Notifique uma equipe.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'descricao',
            description: 'Descrição da pendência.',
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'urgencia',
            description: 'Urgência da pendência.',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Alta', value: 'Alta' },
                { name: 'Média', value: 'Média' },
                { name: 'Baixa', value: 'Baixa' }
            ]
        },
        {
            name: 'equipe',
            description: 'Equipe a ser notificada.',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Restaurante', value: '1267595289108418602' },
                { name: 'Mecanica', value: '1267595267025145856' },
                { name: 'Kids', value: '1267595256862343250' },
                { name: 'Hospital', value: '1267595278798815253' },
                { name: 'Governamental', value: '1267595301783470090' },
                { name: 'Ilegal', value: '1267595241666379806' },
                { name: 'Eventos', value: '1267595190961442899' }
            ]
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, flags: 1 << 6 });
        }

        const descricao = interaction.options.getString('descricao');
        const urgencia = interaction.options.getString('urgencia');
        const equipeId = interaction.options.getString('equipe');
        const canal = await client.channels.fetch(equipeId);
        const data = moment().tz("America/Sao_Paulo");
        const currentChannel = interaction.channel;

        const embed = new Discord.EmbedBuilder()
            .setTitle('**PENDÊNCIA AGUARDANDO** :hourglass_flowing_sand:')
            .setDescription(`\n\n**Descrição:**\n\`\`\`${descricao}\`\`\`\nClique no botão abaixo para ir até o canal correspondente.\n\n**INFORMAÇÕES**\n- **Canal:** ${currentChannel}\n- **Horário:** ${data.format('DD/MM/YYYY')} às ${data.format('HH:mm')}.\n- **Categoria:** ${currentChannel.parent ? `${currentChannel.parent.name}` : 'Sem categoria'}\n- **Urgência:** ${urgencia}\n\n**Criador da pendência:** ${interaction.user}`)
            .setColor('ff0000');

        const resolveButton = new Discord.ButtonBuilder()
            .setLabel('Resolver')
            .setStyle(Discord.ButtonStyle.Success)
            .setCustomId('resolve_pendencia')
            .setDisabled(false);

        const linkButton = new Discord.ButtonBuilder()
            .setLabel('Ir para o canal')
            .setStyle(Discord.ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${interaction.guild.id}/${currentChannel.id}`);

        const row = new Discord.ActionRowBuilder().addComponents(linkButton, resolveButton);

        if (canal) {
            await canal.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: `Pendência registrada e enviada para a equipe ${canal.name}.`, flags: 1 << 6 });
        } else {
            await interaction.reply({ content: `Não foi possível encontrar o canal especificado.`, flags: 1 << 6 });
        }
    }
};
