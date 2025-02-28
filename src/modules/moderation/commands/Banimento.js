const Discord = require("discord.js");

module.exports = {
    name: "ban",
    description: "[FERRAMENTAS] Bane um membro do servidor",
    type: 1,
    options: [
        {
            name: 'usuário',
            description: 'Mencione um usuário ou forneça um ID.',
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'motivo',
            description: 'Diga o motivo do banimento',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'id',
            description: 'ID do membro',
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    permissions: {},
    run: async (client, interaction, args) => {
        const permitidos = ["1140884922454790146", "1140885168857567374", "1187530218357923940"];
        const motivo = interaction.options.getString("motivo");
        const membro = interaction.options.getUser("usuário");
        const id = interaction.options.getString("id");

        if (!interaction.member.roles.cache.some(r => permitidos.includes(r.id))) {
            return interaction.reply({
                content: `Opa! Você não tem permissão.`,
                ephemeral: true
            });
        }

        const member = interaction.guild.members.cache.get(membro.id);
        if (!member) {
            return interaction.reply({ content: `Usuário não encontrado.`, ephemeral: true });
        }

        if (membro.bot || interaction.user.id === membro.id) {
            return interaction.reply({
                content: `Bots não podem ser banidos e você não pode banir a si mesmo.`,
                ephemeral: true
            });
        }

        try {

            const banChannel = '1263698671174811728'; // Canal para registrar o banimento
            const banChannelObj = client.channels.cache.get(banChannel);
            await member.roles.add("1140886667822104597");
            const banEmbed = new Discord.EmbedBuilder()
                .setColor("ff0000")
                .setTitle("BANIMENTO")
                .setDescription(`**Usuário:** ${membro} (${membro.id}) foi banido.\n**ID:** ${id}\n**Motivo:** ${motivo}\n**Banido por:** ${interaction.user}`);

            banChannelObj.send({ embeds: [banEmbed] });
            interaction.reply({ content: `Usuário banido com sucesso!`, ephemeral: true });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: `Houve um erro ao tentar banir o usuário.`,
                ephemeral: true
            });
        }
    }
};