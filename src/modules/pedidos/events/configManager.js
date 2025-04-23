const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../data/pix.json');

let config = {
    chave_pix: 'pix@apestudio.dev',
    canais_logs: 'CANAL_LOGS_DEFAULT',
    canal_confirmacao: 'CANAL_CONFIRMACAO_DEFAULT',
    imagem_embed: 'https://cdn.discordapp.com/attachments/xxx/pedido.png'
};

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath));
        } else {
            saveConfig();
        }
    } catch (err) {}
}

function saveConfig() {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (err) {}
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