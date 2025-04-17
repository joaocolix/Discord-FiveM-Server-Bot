const Discord = require('discord.js')
const client = require('../../../index')
const fs = require("fs");
const path = require("path");

const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

function saveAntiLinkData(data) {
    fs.writeFileSync(antiLinkPath, JSON.stringify(data, null, 4));
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "antilink_menu") return;

    const guildId = interaction.guild.id;
    const data = loadAntiLinkData();
    if (!data[guildId]) {
        data[guildId] = { channels: [], allowedRoles: [] };
    }

    const selected = interaction.values[0];

    if (selected === "add_channel") {
        const channelMenu = new Discord.ChannelSelectMenuBuilder()
            .setCustomId("antilink_add_channel")
            .setPlaceholder("Selecione o canal para ativar o anti-link")
            .addChannelTypes(Discord.ChannelType.GuildText);

        const row = new Discord.ActionRowBuilder().addComponents(channelMenu);
        await interaction.update({ content: "Escolha o canal para adicionar ao anti-link:", components: [row] });

    } else if (selected === "remove_channel") {
        const options = data[guildId].channels.map(ch => ({
            label: `#${interaction.guild.channels.cache.get(ch)?.name || "Canal desconhecido"}`,
            value: ch
        }));

        if (!options.length) return interaction.update({ content: "Nenhum canal configurado ainda.", components: [] });

        const select = new Discord.StringSelectMenuBuilder()
            .setCustomId("antilink_remove_channel")
            .setPlaceholder("Escolha o canal para remover")
            .addOptions(options);

        const row = new Discord.ActionRowBuilder().addComponents(select);
        await interaction.update({ content: "Selecione o canal para remover do anti-link:", components: [row] });

    }  else if (selected === "allow_role") {
        const roleMenu = new Discord.RoleSelectMenuBuilder()
            .setCustomId("antilink_allow_role")
            .setPlaceholder("Selecione um cargo");

        const row = new Discord.ActionRowBuilder().addComponents(roleMenu);
        await interaction.update({ content: "Selecione o cargo que poderá enviar links:", components: [row] });
    }   else if (selected === "remove_role") {
        const roles = data[guildId].allowedRoles
            .filter(roleId => interaction.guild.roles.cache.has(roleId))
            .map(roleId => {
                const role = interaction.guild.roles.cache.get(roleId);
                return {
                    label: role.name,
                    value: role.id
                };
            });
    
        if (!roles.length) {
            return interaction.update({
                content: "Nenhum cargo permitido configurado.",
                components: []
            });
        }
    
        const select = new Discord.StringSelectMenuBuilder()
            .setCustomId("antilink_remove_role")
            .setPlaceholder("Selecione um cargo para remover")
            .addOptions(roles);
    
        const row = new Discord.ActionRowBuilder().addComponents(select);
    
        await interaction.update({
            content: "Escolha o cargo que deseja remover da permissão para enviar links:",
            components: [row]
        });
    }  else if (selected === "add_link") {
        const modal = new Discord.ModalBuilder()
            .setCustomId("antilink_add_link_modal")
            .setTitle("Adicionar link permitido");
    
        const input = new Discord.TextInputBuilder()
            .setCustomId("link_input")
            .setLabel("Link ou domínio permitido")
            .setStyle(Discord.TextInputStyle.Short)
            .setRequired(true);
    
        const row = new Discord.ActionRowBuilder().addComponents(input);
        modal.addComponents(row);
    
        await interaction.showModal(modal);
    }  else if (selected === "remove_link") {
        const guildId = interaction.guild.id;
        const data = loadAntiLinkData();
        if (!data[guildId] || !data[guildId].allowedLinks?.length) {
            return interaction.update({
                content: "Nenhum link permitido configurado.",
                components: []
            });
        }
    
        const options = data[guildId].allowedLinks.map(link => ({
            label: link.length > 25 ? link.slice(0, 25) + "..." : link,
            value: link
        }));
    
        const select = new Discord.StringSelectMenuBuilder()
            .setCustomId("antilink_remove_link")
            .setPlaceholder("Escolha um link para remover")
            .addOptions(options);
    
        const row = new Discord.ActionRowBuilder().addComponents(select);
    
        await interaction.update({
            content: "Escolha um link/domínio para remover da whitelist:",
            components: [row]
        });
    }  else if (selected === "set_log") {
        const select = new Discord.ChannelSelectMenuBuilder()
            .setCustomId("antilink_set_log")
            .setPlaceholder("Selecione um canal de log")
            .addChannelTypes(Discord.ChannelType.GuildText);
    
        const row = new Discord.ActionRowBuilder().addComponents(select);
    
        await interaction.update({
            content: "Selecione o canal onde os logs serão enviados:",
            components: [row]
        });
    }  else if (selected === "list_config") {
        const guildId = interaction.guild.id;
        const data = loadAntiLinkData();
        const guildData = data[guildId];
    
        if (!guildData) {
            const emptyEmbed = new Discord.EmbedBuilder()
                .setTitle("Configurações")
                .setDescription("Nenhuma configuração foi encontrada para este servidor.\n\nVocê pode importar um arquivo ou começar do zero.")
                .setColor("#ffcc00");
        
            const row = new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId("antilink_reset_config")
                    .setLabel("Resetar Configurações")
                    .setStyle(Discord.ButtonStyle.Danger),
                new Discord.ButtonBuilder()
                    .setCustomId("antilink_import_config")
                    .setLabel("Importar JSON")
                    .setStyle(Discord.ButtonStyle.Primary),
                new Discord.ButtonBuilder()
                    .setCustomId("antilink_restore_backup")
                    .setLabel("Restaurar")
                    .setStyle(Discord.ButtonStyle.Success)
            );
        
            return interaction.update({
                content: "",
                embeds: [emptyEmbed],
                components: [row]
            });
        }        
    
        const canais = Array.isArray(guildData.channels) && guildData.channels.length
        ? guildData.channels.map(id => `<#${id}>`).join("\n")
        : "*Nenhum canal configurado*";
    
        const cargos = Array.isArray(guildData.allowedRoles) && guildData.allowedRoles.length
            ? guildData.allowedRoles.map(id => `<@&${id}>`).join("\n")
            : "*Nenhum cargo configurado*";
        
        const links = Array.isArray(guildData.allowedLinks) && guildData.allowedLinks.length
            ? guildData.allowedLinks.map(l => `\`${l}\``).join("\n")
            : "*Nenhum link permitido*";
        
        const logChannel = typeof guildData.logChannel === "string"
            ? `<#${guildData.logChannel}>`
            : "*Não configurado*";

        const modeLabel = {
            default: "Padrão (deletar e avisar)",
            silent: "Silencioso (só deletar)",
            log_only: "Apenas log",
            warn: "Advertência (sem deletar)"
        };

        const modoAtual = modeLabel[guildData.mode] || "Não definido (usando padrão)";

        const embed = new Discord.EmbedBuilder()
            .setTitle("Configurações")
            .addFields(
                { name: "Canais protegidos", value: canais, inline: false },
                { name: "Cargos com permissão", value: cargos, inline: false },
                { name: "Links permitidos", value: links, inline: false },
                { name: "Canal de log", value: logChannel, inline: false },
                { name: "Modo de ação", value: modoAtual, inline: false }
            )
            .setColor("#0099ff")
            .setTimestamp();

        const row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
                .setCustomId("antilink_reset_config")
                .setLabel("Resetar")
                .setStyle(Discord.ButtonStyle.Danger),

            new Discord.ButtonBuilder()
                .setCustomId("antilink_export_config")
                .setLabel("Exportar")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setCustomId("antilink_import_config")
                .setLabel("Importar")
                .setStyle(Discord.ButtonStyle.Secondary),

            new Discord.ButtonBuilder()
                .setCustomId("antilink_restore_backup")
                .setLabel("Restaurar")
                .setStyle(Discord.ButtonStyle.Success)
        );

    
        await interaction.update({
            content: "",
            embeds: [embed],
            components: [row]
        });
    }  else if (selected === "set_mode") {
        const menu = new Discord.StringSelectMenuBuilder()
            .setCustomId("antilink_mode_select")
            .setPlaceholder("Selecione o modo de ação")
            .addOptions([
                { label: "Padrão (deletar e avisar)", value: "default",},
                { label: "Silencioso (só deletar)", value: "silent",},
                { label: "Apenas log", value: "log_only", },
                { label: "Advertência (sem deletar)", value: "warn", }
            ]);
    
        const row = new Discord.ActionRowBuilder().addComponents(menu);
    
        await interaction.update({
            content: "Selecione o modo de ação para links detectados:",
            components: [row]
        });
    }    
});
