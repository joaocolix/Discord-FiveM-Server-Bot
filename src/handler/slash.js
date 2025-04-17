const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
    const SlashsArray = [];

    fs.readdirSync("./src/modules").forEach(folder => {
        const commandsPath = path.join("./src/modules", folder, "commands");

        if (!fs.existsSync(commandsPath)) return;

        fs.readdirSync(commandsPath).forEach(file => {
            if (!file.endsWith('.js')) return; 

            const command = require(path.resolve(commandsPath, file));
            if (!command?.name) return;

            client.slashCommands.set(command.name, command);
            SlashsArray.push(command);

            console.log(`[CARREGADO] Comando: ${command.name}`.green);
        });
    });

    client.on("ready", async () => {
        client.guilds.cache.forEach(guild => guild.commands.set(SlashsArray));
    });
};
