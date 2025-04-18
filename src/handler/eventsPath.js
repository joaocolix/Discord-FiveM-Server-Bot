const fs = require('fs');
const path = require('path');

const modulesPath = path.join(__dirname, '..', 'modules');

module.exports = (client) => {
    fs.readdir(modulesPath, (err, folders) => {
        if (err) return console.error(err);

        folders.forEach(folder => {
            const eventsPath = path.join(modulesPath, folder, 'events');

            if (fs.existsSync(eventsPath)) {
                fs.readdir(eventsPath, (err, files) => {
                    if (err) return console.error(err);

                    files.forEach(file => {
                        const eventFilePath = path.join(eventsPath, file);

                        if (file.endsWith('.js')) {
                            const event = require(eventFilePath);
                            const eventName = file.split('.')[0];

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
