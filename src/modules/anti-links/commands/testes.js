const Discord = require("discord.js");

module.exports = {
    name: "testfullcomponents",
    description: "Painel com TODOS os componentes V2",
    type: Discord.ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "Você não tem permissão pra isso.",
                ephemeral: true
            });
        }

        const payload = {
            flags: 1 << 15,
            components: [
                {
                    type: 17,
                    accent_color: 0x7289DA,
                    components: [
                        {
                            type: 10,
                            content: "# Painel Completo de Components V2\nExplore abaixo todos os elementos!"
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: "Botão Azul",
                                    style: 1,
                                    custom_id: "btn_blue"
                                },
                                {
                                    type: 2,
                                    label: "Botão Sucesso",
                                    style: 3,
                                    custom_id: "btn_success"
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 3,
                                    custom_id: "menu_string",
                                    placeholder: "Escolha uma opção...",
                                    options: [
                                        { label: "Opção A", value: "a" },
                                        { label: "Opção B", value: "b" },
                                        { label: "Opção C", value: "c" }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 5,
                                    custom_id: "menu_user",
                                    placeholder: "Selecione um usuário"
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 6,
                                    custom_id: "menu_role",
                                    placeholder: "Selecione um cargo"
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 7,
                                    custom_id: "menu_mentionable",
                                    placeholder: "Selecione algo mencionável"
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 8,
                                    custom_id: "menu_channel",
                                    placeholder: "Selecione um canal"
                                }
                            ]
                        },
                        {
                            type: 14
                        },
                        {
                            type: 10,
                            content: "Abaixo, temos uma galeria de imagens:"
                        },
                        {
                            type: 12,
                            items: [
                                { media: { url: "https://quatrorodas.abril.com.br/wp-content/uploads/2019/08/uno-mile-modelo-1980-da-fiat-do-colecionador-secc81rgio-minervini.-e1566934866507.jpg?quality=70&strip=info" } },
                                { media: { url: "https://quatrorodas.abril.com.br/wp-content/uploads/2019/08/uno-mile-modelo-1980-da-fiat-do-colecionador-secc81rgio-minervini.-e1566934866507.jpg?quality=70&strip=info" } },
                                { media: { url: "https://quatrorodas.abril.com.br/wp-content/uploads/2019/08/uno-mile-modelo-1980-da-fiat-do-colecionador-secc81rgio-minervini.-e1566934866507.jpg?quality=70&strip=info" } }
                            ]
                        }
                    ]
                }
            ]
        };

        const channelId = interaction.channel.id;
        const token = client.token;

        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        await interaction.reply({ content: "Painel completo enviado!", ephemeral: true });
    }
};