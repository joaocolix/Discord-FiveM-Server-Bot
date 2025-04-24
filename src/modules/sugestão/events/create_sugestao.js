const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const client = require('../../../index');
const sugestaoConfig = require('../data/sugestao.json');

const votos = new Map();
const votosFile = path.join(__dirname, '../data/votos.json');

function carregarVotos() {
    if (fs.existsSync(votosFile)) {
        const raw = JSON.parse(fs.readFileSync(votosFile));
        for (const id in raw) {
            votos.set(id, {
                sim: new Set(raw[id].sim),
                nao: new Set(raw[id].nao),
                canalId: raw[id].canalId,
                message: null
            });
        }
    }
}

function salvarVotos() {
    const plainData = {};
    for (const [id, { sim, nao, canalId }] of votos.entries()) {
        plainData[id] = {
            sim: Array.from(sim),
            nao: Array.from(nao),
            canalId
        };
    }
    fs.writeFileSync(votosFile, JSON.stringify(plainData, null, 2));
}

async function reassociarMensagens() {
    for (const [id, data] of votos.entries()) {
        try {
            const canal = await client.channels.fetch(data.canalId);
            const mensagem = await canal.messages.fetch(id);
            data.message = mensagem;
        } catch (err) {}
    }
}

client.once('ready', async () => {
    carregarVotos();
    await reassociarMensagens();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (!sugestaoConfig.canaisPermitidos.includes(message.channel.id)) return;

    if (message.content.startsWith(sugestaoConfig.prefixo)) {
        const sugestaoTexto = message.content.slice(sugestaoConfig.prefixo.length).trim();

        if (!sugestaoTexto) {
            const aviso = await message.channel.send({
                content: `<@${message.author.id}>, você precisa escrever sua sugestão após o prefixo!\n\nExemplo:\n\`\`\`\n${sugestaoConfig.prefixo} Sua sugestão aqui!\n\`\`\``,
                allowedMentions: { users: [message.author.id] }
            });
            setTimeout(() => aviso.delete().catch(() => {}), 15000);
            return message.delete().catch(() => {});
        }

        const embed = new EmbedBuilder()
            .setColor("#2b2d31")
            .setDescription(`\`\`\`${sugestaoTexto}\`\`\``)
            .setFooter({ text: `Utilize ${sugestaoConfig.prefixo} antes de sua sugestão.` });

        const row = gerarBotoes(0, 0);

        const sentMessage = await message.channel.send({
            content: `**Nova sugestão recebida,** enviada por ${message.author}`,
            embeds: [embed],
            components: [row]
        });

        if (sugestaoConfig.criarTopico) {
            try {
                await sentMessage.startThread({
                    name: `Discussão: Sugestão de ${message.author.username}`,
                    autoArchiveDuration: 60,
                    reason: 'Discussão sobre a sugestão enviada'
                });
            } catch {}
        }

        votos.set(sentMessage.id, {
            sim: new Set(),
            nao: new Set(),
            canalId: message.channel.id,
            message: sentMessage
        });

        salvarVotos();
        await message.delete().catch(() => {});
    } else {
        const aviso = await message.channel.send({
            content: `<@${message.author.id}>, para enviar uma sugestão utilize o prefixo:\n\`\`\`\n${sugestaoConfig.prefixo} ${message.content.trim()}\n\`\`\``,
            allowedMentions: { users: [message.author.id] }
        });
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
        await message.delete().catch(() => {});
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    if (!['votar_sim', 'votar_nao'].includes(customId)) return;

    const votoData = votos.get(interaction.message.id);
    if (!votoData) {
        return interaction.reply({
            content: 'Os votos não estão mais disponíveis para essa sugestão.',
            flags: 1 << 6
        });
    }

    const userId = interaction.user.id;

    if (customId === 'votar_sim') {
        votoData.nao.delete(userId);
        votoData.sim.add(userId);
    } else if (customId === 'votar_nao') {
        votoData.sim.delete(userId);
        votoData.nao.add(userId);
    }

    salvarVotos();
    await atualizarBotoes(votoData);

    return interaction.reply({
        content: `Seu voto foi registrado como **${customId === 'votar_sim' ? 'Concorda' : 'Discorda'}**.`,
        flags: 1 << 6
    });
});

function gerarBotoes(sim, nao) {
    const total = sim + nao;
    let texto = '0%';
    let estilo = ButtonStyle.Secondary;

    if (total > 0) {
        const simPercent = ((sim / total) * 100).toFixed(0);
        const naoPercent = ((nao / total) * 100).toFixed(0);

        if (simPercent > naoPercent) {
            estilo = ButtonStyle.Success;
            texto = `${simPercent}%`;
        } else if (naoPercent > simPercent) {
            estilo = ButtonStyle.Danger;
            texto = `${naoPercent}%`;
        } else {
            texto = `${simPercent}%`;
        }
    }

    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('votar_sim').setLabel('✅').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('votar_nao').setLabel('❌').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('porcentagem_display').setLabel(texto).setStyle(estilo).setDisabled(true)
    );
}

async function atualizarBotoes(votoData) {
    const sim = votoData.sim.size;
    const nao = votoData.nao.size;
    const row = gerarBotoes(sim, nao);
    await votoData.message.edit({ components: [row] });
}