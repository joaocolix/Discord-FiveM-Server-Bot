const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../data/configs.json');

let config = {
    chave_pix: 'pix@apestudio.dev',
    canal_logs: 'CANAL_LOGS_DEFAULT',
    canal_confirmacao: 'CANAL_CONFIRMACAO_DEFAULT',
    imagem_embed: 'https://cdn.discordapp.com/attachments/xxx/pedido.png'
};

function loadConfig() {
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath));
    } else {
        saveConfig();
    }
}

function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getConfig() {
    return config;
}

function updateConfig(key, value) {
    if (value === undefined || value === null) return;
    config[key] = value;
    saveConfig();
}

loadConfig();

module.exports = { getConfig, updateConfig };