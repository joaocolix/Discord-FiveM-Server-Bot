const Discord = require('discord.js')
const { PIX } = require('gpix/dist')
const Canvas = require('canvas')
const moment = require('moment-timezone');

module.exports = {
    name: 'gerar-pedido',
    description: '[ADM] Gera um QRCode PIX com um valor especificado.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'descrição',
            description: "Descrição do que será cobrado (pedido).",
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'valor',
            description: 'Valor a ser cobrado pelo PIX.',
            type: Discord.ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "pagador",
            description: "Pagador do pedido",
            type: Discord.ApplicationCommandOptionType.User,
            required: true
        }
    ],

    run: async (client, interaction) => {

        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true });
        }

        const valor = interaction.options.getNumber('valor');
        const desc = interaction.options.getString('descrição')
        const pagador = interaction.options.getUser('pagador')
        const data = moment().tz("America/Sao_Paulo");
        const currentChannel = interaction.channel;
        const chave = 'pagamentos@euphoriagg.com';

        const pix = PIX.static()
            .setReceiverName(client.user.username)
            .setReceiverCity('Brasil')
            .setKey(chave)
            .setDescription(desc)
            .setAmount(valor);

        const canvas = Canvas.createCanvas(1200, 1200);
        const context = canvas.getContext('2d');
        const qrCodeImage = await Canvas.loadImage(await pix.getQRCode());
        context.fillStyle = "FFFFFF";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(qrCodeImage, 0, 0, canvas.width, canvas.height);

        const embed = new Discord.EmbedBuilder()
            .setImage(`attachment://qrcode.png`)
			.setTitle(`**NOVO PEDIDO GERADO!**`)
            .setColor("#ffcc01")
			.setDescription(`\n\n**Detalhes:**\n- **Cliente:** ${pagador}\n- **Produto:** ${desc}\n- **Valor:** R$ ${valor}\n- **Horário:** ${data.format('DD/MM/YYYY')} às ${data.format('HH:mm')}.\n\n**Gerado por:** ${interaction.user}\n\n**Chave pix:** ${chave}\n**Nome Registrado:**LEVI GURGEL`);

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('copy_pix')
                    .setLabel('Copiar Chave PIX')
                    .setStyle(Discord.ButtonStyle.Success)
            );

        await interaction.channel.send({
            embeds: [embed],
            files: [{
                name: 'qrcode.png',
                attachment: canvas.toBuffer()
            }],
            components: [row]
        });

        await interaction.reply({ content: `Pedido gerado.`, ephemeral: true });
    }
}