const fs = require('fs');
const path = require('path');

// Caminho para a pasta 'modules'
const modulesPath = path.join(__dirname, '..', 'modules');

module.exports = (client) => {
    fs.readdir(modulesPath, (err, folders) => {
        if (err) return console.error(err);

        folders.forEach(folder => {
            const eventsPath = path.join(modulesPath, folder, 'events');

            // Verifica se a pasta 'events' existe dentro da pasta do módulo
            if (fs.existsSync(eventsPath)) {
                fs.readdir(eventsPath, (err, files) => {
                    if (err) return console.error(err);

                    files.forEach(file => {
                        const eventFilePath = path.join(eventsPath, file);

                        // Garante que seja um arquivo .js antes de requerer
                        if (file.endsWith('.js')) {
                            const event = require(eventFilePath);
                            const eventName = file.split('.')[0];

                            // Verifica se o evento exporta uma função ou um objeto com uma função 'execute'
                            if (typeof event === 'function') {
                                client.on(eventName, event.bind(null, client));
                            } else if (typeof event.execute === 'function') {
                                client.on(eventName, event.execute.bind(null, client));
                            }

                            console.log(`[CARREGADO] Evento: ${eventName}`.green);
                        }
                    });
                });
            }
        });
    });
};
