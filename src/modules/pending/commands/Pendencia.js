const Discord = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    name: 'gerar-pendencia',
    description: '[FERRAMENTA] Registra uma pendência com uma descrição e urgência especificada.',
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
            name: 'canal',
            description: 'Canal onde a pendência será enviada.',
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
            channelTypes: [Discord.ChannelType.GuildText]
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true });
        }

        const descricao = interaction.options.getString('descricao');
        const urgencia = interaction.options.getString('urgencia');
        const canal = interaction.options.getChannel('canal');
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
            await interaction.reply({ content: `Pendência registrada e enviada para o canal ${canal.name}.`, ephemeral: true });
        } else {
            await interaction.reply({ content: `Não foi possível encontrar o canal especificado.`, ephemeral: true });
        }
    }
};