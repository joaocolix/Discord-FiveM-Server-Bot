const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
    name: 'relatorio',
    description: '[ADM] Gera um relatório com gráfico das vendas confirmadas nos últimos dias.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'dias',
            description: 'Número de dias para considerar no relatório.',
            type: Discord.ApplicationCommandOptionType.Integer,
            required: true
        },
        {
            name: 'usuario',
            description: 'Filtrar por um usuário específico (opcional).',
            type: Discord.ApplicationCommandOptionType.User,
            required: false
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, flags: 1 << 6 });
        }

        const dias = interaction.options.getInteger('dias');
        const usuario = interaction.options.getUser('usuario');
        const vendasPath = path.resolve(__dirname, '../data/vendas.json');

        if (!fs.existsSync(vendasPath)) {
            return interaction.reply({ content: 'Nenhuma venda registrada ainda.', flags: 1 << 6 });
        }

        const vendas = JSON.parse(fs.readFileSync(vendasPath));

        const vendasFiltradas = vendas.filter(v => {
            const dataVenda = moment(v.dataConfirmacao);
            const dentroDoPeriodo = dataVenda.isAfter(moment().subtract(dias, 'days'));
            const doUsuario = usuario ? v.pagadorId === usuario.id : true;
            return dentroDoPeriodo && doUsuario;
        });

        if (vendasFiltradas.length === 0) {
            return interaction.reply({
                content: usuario
                    ? `Nenhuma venda registrada para ${usuario} nos últimos ${dias} dias.`
                    : `Nenhuma venda registrada nos últimos ${dias} dias.`,
                flags: 1 << 6
            });
        }

        const vendasPorDia = {};
        for (const venda of vendasFiltradas) {
            const dia = moment(venda.dataConfirmacao).format('DD/MM');
            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + venda.valor;
        }

        const labels = Object.keys(vendasPorDia);
        const valores = Object.values(vendasPorDia);
        const total = valores.reduce((acc, val) => acc + val, 0);

        const width = 800;
        const height = 600;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const maxValor = Math.max(...valores);
        const barWidth = 50;
        const gap = 30;
        const baseY = height - 100;

        labels.forEach((label, i) => {
            const barHeight = (valores[i] / maxValor) * 300;
            ctx.fillStyle = '#3498db';
            ctx.fillRect(60 + i * (barWidth + gap), baseY - barHeight, barWidth, barHeight);

            ctx.fillStyle = '#000';
            ctx.font = '16px sans-serif';
            ctx.fillText(`R$${valores[i]}`, 60 + i * (barWidth + gap), baseY - barHeight - 10);
            ctx.fillText(label, 60 + i * (barWidth + gap), baseY + 20);
        });

        const buffer = canvas.toBuffer();

        const embed = new Discord.EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('📊 Relatório de Vendas')
            .setDescription(
                usuario
                    ? `**Usuário:** ${usuario}\n**Total nos últimos ${dias} dias:** R$ ${total.toFixed(2)}`
                    : `**Total de vendas nos últimos ${dias} dias:** R$ ${total.toFixed(2)}`
            )
            .setImage('attachment://grafico.png')
            .setFooter({ text: `Relatório gerado em ${moment().tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss')}` });

        await interaction.reply({
            embeds: [embed],
            files: [{
                name: 'grafico.png',
                attachment: buffer
            }]
        });
    }
};