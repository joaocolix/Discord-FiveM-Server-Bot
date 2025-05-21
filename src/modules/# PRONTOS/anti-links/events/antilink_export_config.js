const Discord = require('discord.js');
const client = require('../../../index');
const fs = require("fs");
const path = require("path");

const sendLog = require("./antilink_send_logs");
const res = require('../../../utils/resTypes');
const antiLinkPath = path.join(__dirname, "../data/antiLinkChannels.json");

function loadAntiLinkData() {
    if (!fs.existsSync(antiLinkPath)) {
        fs.writeFileSync(antiLinkPath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(antiLinkPath));
}

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "antilink_export_config") {
        const data = loadAntiLinkData();
        const guildId = interaction.guild.id;
    
        if (!data[guildId]) {
            return interaction.update(
                res.warning("Nenhuma configuração encontrada para exportar.", {
                    ephemeral: true,
                    components: [ ],
                })
            );
        }
    
        const config = {
            channels: data[guildId].channels || [],
            allowedRoles: data[guildId].allowedRoles || [],
            allowedLinks: data[guildId].allowedLinks || [],
            logChannel: data[guildId].logChannel || null,
            mode: data[guildId].mode || "default"
        };
        
        const configJson = JSON.stringify(config, null, 4);        
        const buffer = Buffer.from(configJson, 'utf-8');

        const attachment = new Discord.AttachmentBuilder(buffer, {
            name: `antilink-config-${guildId}.json`
        });
                
        await interaction.update(
            res.success("Aqui está sua configuração exportada:", {
                ephemeral: true,
                files: [attachment],
                components: [ ],
            })
        );
    }
});