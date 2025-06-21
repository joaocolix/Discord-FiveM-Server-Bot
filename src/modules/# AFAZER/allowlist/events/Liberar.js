const Discord = require('discord.js');
const client = require('../../../index');
const database = require('../database/database');
const config = require('../data/database.json');
const moment = require('moment-timezone');

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "botao_liberar") {
            if (!interaction.guild.channels.cache.get(config.canallogwl)) {
                return interaction.reply({ content: `Opa! parece que o sistema está desativado.`, flags: 1 << 6 });
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId("modal_liberar")
                .setTitle("Liberação");

            const idInput = new Discord.TextInputBuilder()
                .setCustomId("id_do_player")
                .setLabel("INSIRA SEU TOKEN ID")
                .setMaxLength(50)
                .setMinLength(1)
                .setPlaceholder("1234")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(idInput)
            );

            await interaction.showModal(modal);
        }

        if (interaction.customId === 'botao_resetar') {
            const iddatabase = `${interaction.user.id}`;
            const database_base = await database.whitelist.findOne({ where: { discord: iddatabase } });

            if (database_base) {
                if (database_base.discord) {
                    setTimeout(async () => {
                        database_base.whitelist = 0;
                        database_base.discord = '';
                        await database_base.save();
                        return await interaction.reply({ content: 'ID Resetado!', flags: 1 << 6 });
                    }, 1000);
                }
            } else {
                await interaction.reply({ content: 'Opa! Não consegui encontrar nenhuma conta vinculada ao seu discord.', flags: 1 << 6 });
            }
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modal_liberar") {
            const valueIdd = interaction.fields.getTextInputValue("id_do_player");

            const encontrar_id = await database.whitelist.findOne({ where: { id: valueIdd } });

            if (!encontrar_id) {
                return await interaction.reply({ content: 'Opa! Não consegui encontrar esse token... Tem certeza de que é esse mesmo?', flags: 1 << 6 });
            }

            if (encontrar_id.whitelist === 1) {
                return await interaction.reply({
                    content: `Opa! Parece que esse token já foi liberado por <@${encontrar_id.discord}>`,
                    flags: 1 << 6
                });
            }

            if (encontrar_id.discord != 0) {
                return await interaction.reply({
                    content: `Opa! Parece que esse token já está vinculado por <@${encontrar_id.discord}>`,
                    flags: 1 << 6
                });
            }

            setTimeout(async () => {

                const data = moment().tz("America/Sao_Paulo");


                const embed = new Discord.EmbedBuilder()
                    .setColor("#2b2d31")
                    .setTitle('**NOVA LIBERAÇÃO**')
                    .setDescription(`- **Membro:** <@${interaction.user.id}>\n- **Token:** ${valueIdd} \n- **Discord:** ${interaction.user.id}\n- **Horário:** ${data.format('DD/MM/YYYY')} às ${data.format('HH:mm')}.`);

                encontrar_id.discord = `${interaction.user.id}`;
                encontrar_id.whitelist = 1;

                await encontrar_id.save();

                await interaction.member.roles.add("1280244504825298981");
                await interaction.member.roles.remove("1140886455439343648");
                await interaction.member.roles.remove("1271576799012458526");
                await client.guilds.cache.get(interaction.guild.id).channels.cache.get(config.canallogwl).send({ embeds: [embed] });

                return await interaction.reply({ content: 'Eba! Agora é só entrar em nossa cidade, estou te esperando!', flags: 1 << 6 });
            }, 1000);
        }
    }
});