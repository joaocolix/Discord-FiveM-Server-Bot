const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const moment = require('moment-timezone');
const client = require('../../../index');

const equipesPath = path.join(__dirname, '../data/equipes.json');
const pendenciasTemp = {};
const gerenciamentoTemp = {};

client.on('interactionCreate', async interaction => {
    const userId = interaction.user.id;
    if (interaction.isStringSelectMenu() && interaction.customId === 'menu_principal') {
        if (interaction.values[0] === 'gerar_pendencia') {
            const equipes = JSON.parse(fs.readFileSync(equipesPath, 'utf-8'));
            const menu = new Discord.StringSelectMenuBuilder()
                .setCustomId('selecao_equipe_gerar')
                .setPlaceholder('Escolha a equipe')
                .addOptions(equipes.map(e => ({ label: e.name, value: e.value })));
            const row = new Discord.ActionRowBuilder().addComponents(menu);
            return interaction.update({ content: 'Escolha a equipe para a pendência:', components: [row] });
        }

        if (interaction.values[0] === 'gerenciar_equipes') {
            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder().setCustomId('add_equipe_btn').setLabel('Adicionar').setStyle(Discord.ButtonStyle.Primary),
                new Discord.ButtonBuilder().setCustomId('remove_equipe_btn').setLabel('Remover').setStyle(Discord.ButtonStyle.Danger),
                new Discord.ButtonBuilder().setCustomId('edit_equipe_btn').setLabel('Editar').setStyle(Discord.ButtonStyle.Secondary)
            );

            return interaction.update({ content: 'O que deseja fazer com as equipes?', components: [row] });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'selecao_equipe_gerar') {
        const equipeId = interaction.values[0];
        pendenciasTemp[interaction.user.id] = { equipe: equipeId };

        const modal = new Discord.ModalBuilder()
            .setCustomId('descricao_modal')
            .setTitle('Descrição da Pendência')
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId('descricao_input')
                        .setLabel('Digite a descrição')
                        .setStyle(Discord.TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );
        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'descricao_modal') {
        const { equipe } = pendenciasTemp[interaction.user.id] || {};
        const descricao = interaction.fields.getTextInputValue('descricao_input');
        if (!equipe) return interaction.reply({ content: 'Erro: nenhuma equipe selecionada.', ephemeral: true });

        const data = moment().tz("America/Sao_Paulo");
        const canal = await interaction.client.channels.fetch(equipe);
        const embed = new Discord.EmbedBuilder()
            .setTitle('**PENDÊNCIA AGUARDANDO** ⏳')
            .setDescription(`**Descrição:**\n\`\`\`${descricao}\`\`\`\n**Criador:** ${interaction.user}\n**Data:** ${data.format('DD/MM/YYYY')} às ${data.format('HH:mm')}`)
            .setColor('Red');

        const botao = new Discord.ButtonBuilder().setCustomId('resolve_pendencia').setLabel('Resolver').setStyle(Discord.ButtonStyle.Success);
        const link = new Discord.ButtonBuilder().setLabel('Ir para o canal').setStyle(Discord.ButtonStyle.Link).setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`);
        const row = new Discord.ActionRowBuilder().addComponents(link, botao);

        await canal.send({ embeds: [embed], components: [row] });
        delete pendenciasTemp[interaction.user.id];
        return interaction.reply({ content: 'Pendência enviada com sucesso!', ephemeral: true });
    }

    if (interaction.isButton() && interaction.customId === 'add_equipe_btn') {
        const canais = interaction.guild.channels.cache
            .filter(c => c.type === Discord.ChannelType.GuildText)
            .map(c => ({ label: c.name, value: c.id }))
            .slice(0, 25);
    
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('canal_para_nova_equipe')
            .setPlaceholder('Escolha o canal da nova equipe')
            .addOptions(canais);
    
        const row = new Discord.ActionRowBuilder().addComponents(menu);
        return interaction.update({ content: 'Selecione o canal da nova equipe:', components: [row] });
    }

    if (interaction.customId === 'adicionar_equipe') {
        gerenciamentoTemp[userId] ??= {};
        if (interaction.values[0] === 'add_nome') {
            const modal = new Discord.ModalBuilder()
                .setCustomId('modal_add_nome')
                .setTitle('Nome da Nova Equipe')
                .addComponents(
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId('nome_input')
                            .setLabel('Nome da Equipe')
                            .setStyle(1)
                    )
                );
            return await interaction.showModal(modal);
        }

        if (interaction.values[0] === 'add_canal') {
            const canais = interaction.guild.channels.cache
                .filter(c => c.type === Discord.ChannelType.GuildText)
                .map(c => ({ label: c.name, value: c.id }))
                .slice(0, 25);

            const canalMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('canal_selecionado')
                .setPlaceholder('Selecione o canal')
                .addOptions(canais);

            const row = new Discord.ActionRowBuilder().addComponents(canalMenu);
            return interaction.update({ content: 'Selecione o canal da equipe:', components: [row] });
        }
    }

    if (interaction.customId === 'canal_para_nova_equipe') {
        gerenciamentoTemp[userId] = { canal: interaction.values[0] };
    
        const modal = new Discord.ModalBuilder()
            .setCustomId('modal_nome_para_canal')
            .setTitle('Nome da Equipe')
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId('nome_input')
                        .setLabel('Nome da equipe')
                        .setStyle(1)
                        .setRequired(true)
                )
            );
        return interaction.showModal(modal);
    }    

    if (interaction.customId === 'selecionar_equipe_editar') {
        const equipeSelecionada = interaction.values[0];
        gerenciamentoTemp[userId] = { editar: equipeSelecionada };
    
        const canais = interaction.guild.channels.cache
            .filter(c => c.type === Discord.ChannelType.GuildText)
            .map(c => ({ label: c.name, value: c.id }))
            .slice(0, 25);
    
        const canalMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId('novo_canal_para_editar')
            .setPlaceholder('Escolha o novo canal para a equipe')
            .addOptions(canais);
    
        const row = new Discord.ActionRowBuilder().addComponents(canalMenu);
        return interaction.update({ content: 'Escolha o novo canal da equipe:', components: [row] });
    }  
    
    if (interaction.customId === 'novo_canal_para_editar') {
        gerenciamentoTemp[userId].novoCanal = interaction.values[0];
    
        const modal = new Discord.ModalBuilder()
            .setCustomId('modal_editar_nome')
            .setTitle('Novo Nome da Equipe')
            .addComponents(
                new Discord.ActionRowBuilder().addComponents(
                    new Discord.TextInputBuilder()
                        .setCustomId('novo_nome_input')
                        .setLabel('Digite o novo nome da equipe')
                        .setStyle(1)
                        .setRequired(true)
                )
            );
        return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_add_nome') {
        const nome = interaction.fields.getTextInputValue('nome_input');
        gerenciamentoTemp[userId] ??= {};
        gerenciamentoTemp[userId].nome = nome;

        const canal = gerenciamentoTemp[userId].canal;
        if (canal) {
            const equipes = JSON.parse(fs.readFileSync(equipesPath));
            equipes.push({ name: nome, value: canal });
            fs.writeFileSync(equipesPath, JSON.stringify(equipes, null, 4));
            delete gerenciamentoTemp[userId];
            return interaction.reply({ content: 'Equipe adicionada com sucesso!', ephemeral: true });
        }

        return interaction.reply({ content: 'Nome salvo. Agora selecione o canal.', ephemeral: true });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_nome_para_canal') {
        const nome = interaction.fields.getTextInputValue('nome_input');
        const canal = gerenciamentoTemp[userId]?.canal;
    
        if (!canal) return interaction.reply({ content: 'Erro: nenhum canal selecionado.', ephemeral: true });
    
        const equipes = JSON.parse(fs.readFileSync(equipesPath));
        equipes.push({ name: nome, value: canal });
        fs.writeFileSync(equipesPath, JSON.stringify(equipes, null, 4));
    
        delete gerenciamentoTemp[userId];
        return interaction.reply({ content: 'Equipe adicionada com sucesso!', ephemeral: true });
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_editar_nome') {
        const novoNome = interaction.fields.getTextInputValue('novo_nome_input');
        const dados = gerenciamentoTemp[userId];
    
        if (!dados || !dados.editar || !dados.novoCanal) {
            return interaction.reply({ content: 'Erro ao editar equipe. Dados incompletos.', ephemeral: true });
        }
    
        const equipes = JSON.parse(fs.readFileSync(equipesPath));
        const index = equipes.findIndex(e => e.value === dados.editar);
    
        if (index === -1) {
            return interaction.reply({ content: 'Equipe não encontrada.', ephemeral: true });
        }
    
        equipes[index] = {
            name: novoNome,
            value: dados.novoCanal
        };
    
        fs.writeFileSync(equipesPath, JSON.stringify(equipes, null, 4));
        delete gerenciamentoTemp[userId];
    
        return interaction.reply({ content: 'Equipe editada com sucesso!', ephemeral: true });
    }
    

    if (interaction.isButton() && interaction.customId === 'remove_equipe_btn') {
        const equipes = JSON.parse(fs.readFileSync(equipesPath));
    
        // ✅ Verifica se há equipes antes de tentar montar o menu
        if (!equipes.length) {
            return interaction.reply({
                content: '❌ Não há nenhuma equipe cadastrada para remover.',
                ephemeral: true
            });
        }
    
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('remover_equipe')
            .setPlaceholder('Selecione a equipe para remover')
            .addOptions(equipes.map(e => ({ label: e.name, value: e.value })));
    
        const row = new Discord.ActionRowBuilder().addComponents(menu);
        return interaction.update({
            content: 'Selecione a equipe a ser removida:',
            components: [row]
        });
    }    

    if (interaction.customId === 'remover_equipe') {
        gerenciamentoTemp[userId] = { remover: interaction.values[0] };
        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder().setCustomId('confirmar_remocao').setLabel('Confirmar Remoção').setStyle(Discord.ButtonStyle.Danger)
        );
        return interaction.update({ content: `Confirma remover a equipe?`, components: [row] });
    }

    if (interaction.customId === 'confirmar_remocao') {
        const equipes = JSON.parse(fs.readFileSync(equipesPath));
        const novaLista = equipes.filter(e => e.value !== gerenciamentoTemp[userId].remover);
        fs.writeFileSync(equipesPath, JSON.stringify(novaLista, null, 4));
        delete gerenciamentoTemp[userId];
        return interaction.update({ content: 'Equipe removida com sucesso.', components: [] });
    }

    if (interaction.isButton() && interaction.customId === 'edit_equipe_btn') {
        const equipes = JSON.parse(fs.readFileSync(equipesPath));

        if (equipes.length === 0) {
            return interaction.reply({
                content: '❌ Não há nenhuma equipe cadastrada para editar.',
                ephemeral: true
            });
        }

        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('selecionar_equipe_editar')
            .setPlaceholder('Selecione a equipe para editar')
            .addOptions(equipes.map(e => ({ label: e.name, value: e.value })));

        const row = new Discord.ActionRowBuilder().addComponents(menu);
        return interaction.update({
            content: 'Escolha a equipe que deseja editar:',
            components: [row]
        });
    }
   
    if (interaction.isButton() && interaction.customId === 'resolve_pendencia') {
        const msg = interaction.message;
        const originalEmbed = msg.embeds[0];
    
        // Protege tudo com try/catch
        try {
            if (!originalEmbed) {
                // Se a interação ainda não foi respondida
                if (!interaction.deferred && !interaction.replied) {
                    return interaction.reply({ content: '❌ Nenhum embed encontrado.', ephemeral: true });
                } else {
                    console.warn('❌ Embed ausente e interação já respondida.');
                    return;
                }
            }
    
            const embed = Discord.EmbedBuilder.from(originalEmbed)
                .setTitle('**PENDÊNCIA RESOLVIDA ✅**')
                .setColor('#2b2d31')
                .setDescription(`${originalEmbed.description}\n**Quem resolveu:** ${interaction.user}`);
    
            const linkBtn = msg.components[0]?.components.find(c => c.data?.url);
            const resolveBtn = new Discord.ButtonBuilder()
                .setCustomId('resolve_pendencia')
                .setLabel('Resolvida')
                .setStyle(Discord.ButtonStyle.Success)
                .setDisabled(true);
    
            const row = new Discord.ActionRowBuilder().addComponents(linkBtn, resolveBtn);

            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
    
            await msg.edit({ embeds: [embed], components: [row] });
    
        } catch (error) {
            console.error('❌ Erro ao tentar resolver pendência:', error);
    
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Erro ao processar a ação.', ephemeral: true });
            }
        }
    }
          
});

async function criarEmbed(interaction, dados) {
    const canal = await interaction.client.channels.fetch(dados.equipe);
    const data = moment().tz("America/Sao_Paulo");

    const embed = new Discord.EmbedBuilder()
        .setTitle('**PENDÊNCIA AGUARDANDO** ⏳')
        .setDescription(`**Descrição:**\n\`\`\`${dados.descricao}\`\`\`\n\n**Criador:** ${interaction.user}\n**Data:** ${data.format('DD/MM/YYYY')} às ${data.format('HH:mm')}`)
        .setColor('Red');

    const botao = new Discord.ButtonBuilder().setCustomId('resolve_pendencia').setLabel('Resolver').setStyle(Discord.ButtonStyle.Success);
    const link = new Discord.ButtonBuilder().setLabel('Ir para o canal').setStyle(Discord.ButtonStyle.Link).setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`);
    const row = new Discord.ActionRowBuilder().addComponents(link, botao);

    await canal.send({ embeds: [embed], components: [row] });
    delete pendenciasTemp[interaction.user.id];
    return interaction.followUp({ content: 'Pendência enviada com sucesso!', ephemeral: true });
}