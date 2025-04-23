const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "adv",
    description: "[FERRAMENTAS] Aplique adv em um membro",
    type: 1,
    options: [
        {
            name: 'usuário',
            description: 'Mencione um usuário ou forneça um ID.',
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'motivos',
            description: 'Diga o motivo da adv',
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
        const moti = interaction.options.getString("motivos");
        const membro = interaction.options.getUser("usuário");
        const id = interaction.options.getString("id");

        if (!interaction.member.roles.cache.some(r => permitidos.includes(r.id))) {
            return interaction.reply({
                content: `Opa! Você não tem permissão.`,
                flags: 1 << 6
            });
        }

        const member = interaction.guild.members.cache.get(membro.id);
        if (!member) {
            return interaction.reply({ content: `Usuário não encontrado.`, flags: 1 << 6 });
        }

        if (membro.bot || interaction.user.id === membro.id) {
            return interaction.reply({
                content: `Bots não recebem advertências e você não pode advertir a si mesmo.`,
                flags: 1 << 6
            });
        }

        const cargos = {
            adv1: "1140886498137354240",
            adv2: "1140886542622150656",
            adv3: "1140886601795391510"
        };

        const nomesAdvertencias = {
            adv1: "Advertência 1",
            adv2: "Advertência 2",
            adv3: "Advertência 3"
        };

        const logs = '1263698647456026654';
        const warn = '1274549874385227878';
        const banChannel = '1263698671174811728';
        const userWarnings = `quant_${interaction.user.id}`;
        let roleToAdd, roleToRemove, advLevel;

        if (member.roles.cache.has(cargos.adv2)) {
            roleToRemove = cargos.adv2;
            roleToAdd = cargos.adv3;
            advLevel = 3;
        } else if (member.roles.cache.has(cargos.adv1)) {
            roleToRemove = cargos.adv1;
            roleToAdd = cargos.adv2;
            advLevel = 2;
        } else {
            roleToAdd = cargos.adv1;
            advLevel = 1;
        }

        const thirtyDays = 30 * 24 * 60 * 60 * 1000;

        function setLongTimeout(callback, delay) {
            if (delay > 0x7FFFFFFF) { 
                setTimeout(() => setLongTimeout(callback, delay - 0x7FFFFFFF), 0x7FFFFFFF);
            } else {
                setTimeout(callback, delay);
            }
        }

        try {
            if (roleToRemove) await member.roles.remove(roleToRemove);
            await member.roles.add(roleToAdd);

            await db.add(userWarnings, 1);
            const total = await db.get(userWarnings);

            const warnChannel = client.channels.cache.get(warn);
            const warnEmbed = new Discord.EmbedBuilder()
                .setColor("ffcc01")
                .setTitle("REGISTRO DE PUNIÇÕES")
                .setDescription(`**Usuário:** ${membro} (${membro.id})\n**ID:** ${id}\n**Punição:** ${nomesAdvertencias[`adv${advLevel}`]}\n**Motivo:** ${moti}\n**Advertido por:** ${interaction.user}`);

            warnChannel.send({ embeds: [warnEmbed] });
            interaction.reply({ content: `Feito!`, flags: 1 << 6 });

            const logChannel = client.channels.cache.get(logs);
            logChannel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("ffcc01")
                        .setTitle("REGISTRO DE PUNIÇÕES")
                        .setDescription(`**Usuário:** ${membro} (${membro.id})\n**ID:** ${id}\n**Punição:** ${nomesAdvertencias[`adv${advLevel}`]}\n**Motivo:** ${moti}`)
                ]
            });

            membro.send(`Você recebeu uma advertência.`).catch(() => {});
            membro.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor("ffcc01")
                        .setDescription(`**Punição:** ${nomesAdvertencias[`adv${advLevel}`]}\n**Motivo:** ${moti}`)
                ]
            }).catch(() => {});

            if (advLevel === 3) {
                const banChannelObj = client.channels.cache.get(banChannel);
                banChannelObj.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("ff0000")
                            .setTitle("AVISO DE BANIMENTO")
                            .setDescription(`**Usuário:** ${membro} (${membro.id}) foi banido.\n**ID:** ${id}\n**Motivo:** Acúmulo de advertências (${nomesAdvertencias[`adv${advLevel}`]}).`)
                    ]
                });
            } else if (advLevel === 1 || advLevel === 2) {
                setLongTimeout(async () => {
                    await member.roles.remove(roleToAdd);
                    membro.send(`Seu cargo de advertência ${advLevel} foi removido.`).catch(() => {});
                    membro.send(`Esperamos que você não receba uma advertência novamente.`).catch(() => {});
                }, thirtyDays);
            }

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: `Houve um erro ao tentar aplicar a advertência.`,
                flags: 1 << 6
            });
        }
    }
};