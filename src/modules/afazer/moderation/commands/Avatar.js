const { EmbedBuilder, ButtonBuilder, ApplicationCommandOptionType, ApplicationCommandType, ActionRowBuilder, ButtonStyle } = require(`discord.js`);

module.exports = {
    name: 'avatar',
    description: '[UTILIDADE] Veja o avatar e o banner de um usuario.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "user",
            description: "Selecione o usurario",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],

    run: async (client, interaction) => {
        
        const usermention = interaction.options.getUser(`user`) || interaction.user;
        const avatar = usermention.displayAvatarURL({ size: 1024, format: "png" });
        const banner = await (await client.users.fetch(usermention.id, { force: true })).bannerURL({ size: 4096 });
        await interaction.channel.sendTyping()

        const cmp = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Avatar`)
                    .setCustomId(`avatar`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setLabel(`Banner`)
                    .setCustomId(`banner`)
                    .setStyle(ButtonStyle.Secondary),
            )

        const cmp2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Avatar`)
                    .setCustomId(`avatar`)
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setLabel(`Banner`)
                    .setCustomId(`banner`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
            )

        const cmp3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Avatar`)
                    .setCustomId(`avatar`)
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
            )

        const embed = new EmbedBuilder()
            .setColor("000000")
            .setTitle(`Download`)
            .setURL(avatar)
            .setImage(avatar)

        const embed2 = new EmbedBuilder()
            .setColor("000000")
            .setTitle(`Download`)
            .setURL(banner)
            .setImage(banner)

        if (!banner) {
            const message2 = await interaction.reply({ embeds: [embed], components: [cmp3], flags: 1 << 6 });
            const collector = await message2.createMessageComponentCollector();
            collector.on(`collect`, async c => {
            })
            return;
        }

        
        const message = await interaction.reply({ embeds: [embed], components: [cmp], flags: 1 << 6 });
        const collector = await message.createMessageComponentCollector();

        collector.on(`collect`, async c => {

            if (c.customId === 'avatar') {

                if (c.user.id !== interaction.user.id) {
                    return await c.reply({ content: `${error} Only ${interaction.user.tag} can interact with the buttons!`, flags: 1 << 6 })
                }

                await c.update({ embeds: [embed], components: [cmp], flags: 1 << 6 })
            }

            if (c.customId === 'banner') {

                if (c.user.id !== interaction.user.id) {
                    return await c.reply({ content: `${error} Only ${interaction.user.tag} can interact with the buttons!`, flags: 1 << 6 })
                }

                await c.update({ embeds: [embed2], components: [cmp2], flags: 1 << 6  })
            }
        })
    }
}