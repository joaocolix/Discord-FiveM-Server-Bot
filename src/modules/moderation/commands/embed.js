const {EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

module.exports = {
    name: "criar-embed",
    description: "[FERRAMENTA] Crie uma embed totalmente customizável!",
    type: 1,
    options: [
        {
            name: "canal",
            description: "Escolha o canal para enviar o embed",
            type: 7,
            required: false
        }
    ],

    run: async (client, interaction, config) => {
        const canal = interaction.guild.channels.cache.get(interaction.options.get('canal')?.value || interaction.channel.id);

        if (!canal) return interaction.reply({
            content: `Canal inválido`,
            ephemeral: true
        });

        let embedToEdit = new EmbedBuilder()
            .setDescription('**Eu sou o seu preview!**');

        await interaction.reply({
            embeds: [embedToEdit],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('embed_creator_edit')
                        .setEmoji("<:config:1176169507551727616>")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('embed_creator_save')
                        .setEmoji("<:atalhos:1176712854137745408>")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('embed_creator_json')
                        .setEmoji("<:enviar:1271607751667089501>")
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('embed_creator_insert_json')
                        .setEmoji("<:salvar:1271608163409465344>")
                        .setStyle(ButtonStyle.Secondary),
                )
            ], ephemeral: true
        });

        const collectorBUTTONS = interaction.channel.createMessageComponentCollector({
            type: ComponentType.Button,
            filter: i => i.user.id === interaction.user.id
        });

        collectorBUTTONS.on('collect', async (i) => {
            const ID = i.customId;

            if (ID === "embed_creator_edit") {
                await i.reply({
                    content: 'Escolha uma opção abaixo:',
                    components: [
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('embed_builder')
                                .setPlaceholder('Editar.')
                                .addOptions(
                                    {
                                        label: "Autor",
                                        value: "author"
                                    },
                                    {
                                        label: "Título",
                                        value: "title"
                                    },
                                    {
                                        label: "Descrição",
                                        value: "desc"
                                    },
                                    {
                                        label: "Rodapé",
                                        value: "footer"
                                    },
                                    {
                                        label: "Cor",
                                        value: "color"
                                    },
                                    {
                                        label: "Imagem",
                                        value: "image"
                                    },
                                    {
                                        label: "Thumbnail",
                                        value: "thumbnail"
                                    }
                                )
                        )
                    ],
                    ephemeral: true
                });

            } else if (ID === "embed_creator_save") {
                canal.send({
                    embeds: [embedToEdit]
                }).catch(() => { });

                await i.reply({
                    content: `Feito! Enviei no canal ${canal}.`,
                    ephemeral: true
                }).catch(() => { });

                interaction.deleteReply();
                return collectorBUTTONS.stop();

            } else if (ID === "embed_creator_json") {
                const modal = new ModalBuilder()
                    .setCustomId('json_modal')
                    .setTitle('Inserir JSON da Embed');

                const textInput = new TextInputBuilder()
                    .setCustomId('json_input')
                    .setLabel('Insira o JSON da embed')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('JSON da embed')
                    .setMaxLength(4000)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(textInput));
                await i.showModal(modal);

            } else if (ID === "embed_creator_insert_json") {
                const json = embedToEdit.toJSON();
                await i.reply({
                    content: `Aqui está o JSON da embed:\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``,
                    ephemeral: true
                });
            }
        });

        const collectorMENU = interaction.channel.createMessageComponentCollector({
            type: ComponentType.StringSelect,
            filter: i => i.user.id === interaction.user.id
        });

        collectorMENU.on('collect', async (i) => {
            if (!i.values) return;

            const ID = i.values[0];
            let modal;
            let textInput;

            if (ID === "author") {
                modal = new ModalBuilder()
                    .setCustomId('author_modal')
                    .setTitle('Adicionar Autor');

                textInput = new TextInputBuilder()
                    .setCustomId('author_input')
                    .setLabel('Insira o nome do autor')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Nome do autor')
                    .setMaxLength(256)
                    .setRequired(true);

            } else if (ID === "title") {
                modal = new ModalBuilder()
                    .setCustomId('title_modal')
                    .setTitle('Adicionar Título');

                textInput = new TextInputBuilder()
                    .setCustomId('title_input')
                    .setLabel('Insira o título')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Título da embed')
                    .setMaxLength(256)
                    .setRequired(true);

            } else if (ID === "desc") {
                modal = new ModalBuilder()
                    .setCustomId('desc_modal')
                    .setTitle('Adicionar Descrição');

                textInput = new TextInputBuilder()
                    .setCustomId('desc_input')
                    .setLabel('Insira a descrição')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Descrição da embed')
                    .setMaxLength(4000)
                    .setRequired(true);

            } else if (ID === "footer") {
                modal = new ModalBuilder()
                    .setCustomId('footer_modal')
                    .setTitle('Adicionar Rodapé');

                textInput = new TextInputBuilder()
                    .setCustomId('footer_input')
                    .setLabel('Insira o texto do rodapé')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Texto do rodapé')
                    .setMaxLength(2048)
                    .setRequired(true);

            } else if (ID === "color") {
                modal = new ModalBuilder()
                    .setCustomId('color_modal')
                    .setTitle('Adicionar Cor');

                textInput = new TextInputBuilder()
                    .setCustomId('color_input')
                    .setLabel('Insira a cor em hexadecimal')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('#000000')
                    .setMaxLength(7)
                    .setRequired(true);

            } else if (ID === "image") {
                modal = new ModalBuilder()
                    .setCustomId('image_modal')
                    .setTitle('Adicionar Imagem');

                textInput = new TextInputBuilder()
                    .setCustomId('image_input')
                    .setLabel('Insira o link da imagem')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('URL da imagem')
                    .setRequired(true);

            } else if (ID === "thumbnail") {
                modal = new ModalBuilder()
                    .setCustomId('thumbnail_modal')
                    .setTitle('Adicionar Thumbnail');

                textInput = new TextInputBuilder()
                    .setCustomId('thumbnail_input')
                    .setLabel('Insira o link da thumbnail')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('URL da thumbnail')
                    .setRequired(true);
            }

            modal.addComponents(new ActionRowBuilder().addComponents(textInput));
            await i.showModal(modal);
        });

        client.on('interactionCreate', async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit()) return;
            const customId = modalInteraction.customId;
            const value = modalInteraction.fields.getTextInputValue(`${customId.replace('_modal', '')}_input`);

            if (customId === "author_modal") {
                embedToEdit.setAuthor({ name: value });
            } else if (customId === "title_modal") {
                embedToEdit.setTitle(value);
            } else if (customId === "desc_modal") {
                embedToEdit.setDescription(value);
            } else if (customId === "footer_modal") {
                embedToEdit.setFooter({ text: value });
            } else if (customId === "color_modal") {
                embedToEdit.setColor(value);
            } else if (customId === "image_modal") {
                embedToEdit.setImage(value);
            } else if (customId === "thumbnail_modal") {
                embedToEdit.setThumbnail(value);
            } else if (customId === "json_modal") {
                try {
                    const json = JSON.parse(value);
            
                    if (json.title) embedToEdit.setTitle(json.title);
                    if (json.description) embedToEdit.setDescription(json.description);
                    if (json.color) embedToEdit.setColor(json.color);
                    if (json.author) embedToEdit.setAuthor(json.author);
                    if (json.footer) embedToEdit.setFooter(json.footer);
                    if (json.image) embedToEdit.setImage(json.image.url);
                    if (json.thumbnail) embedToEdit.setThumbnail(json.thumbnail.url);
                    
                    await modalInteraction.reply({
                        content: `Embed atualizada com sucesso!`,
                        ephemeral: true
                    });
            
                    await interaction.editReply({ embeds: [embedToEdit] });
                } catch (error) {
                    await modalInteraction.reply({
                        content: `O JSON fornecido é inválido. Por favor, verifique e tente novamente.`,
                        ephemeral: true
                    });
                }
                return;
            }

            await modalInteraction.reply({
                content: `Feito!`,
                ephemeral: true
            });

            await interaction.editReply({ embeds: [embedToEdit] });
        });

    },
};