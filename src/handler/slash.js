const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
    const SlashsArray = [];

    // Lê todas as pastas dentro de "modules/"
    fs.readdirSync("./src/modules").forEach(folder => {
        const commandsPath = path.join("./src/modules", folder, "commands");

        // Verifica se a pasta "commands" existe dentro da pasta dinâmica
        if (!fs.existsSync(commandsPath)) return;

        // Lê todos os arquivos dentro da pasta "commands"
        fs.readdirSync(commandsPath).forEach(file => {
            if (!file.endsWith('.js')) return; // Ignora arquivos que não são .js

            // Importa o comando
            const command = require(path.resolve(commandsPath, file));
            if (!command?.name) return;

            // Adiciona ao cliente e ao array de comandos
            client.slashCommands.set(command.name, command);
            SlashsArray.push(command);

            console.log(`[CARREGADO] Comando: ${command.name}`.green);
        });
    });

    // Quando o bot estiver pronto, adiciona os comandos ao Discord
    client.on("ready", async () => {
        client.guilds.cache.forEach(guild => guild.commands.set(SlashsArray));
    });
};
