const { webhookURL } = require('../config.json');
require('colors');

async function sendToWebhook(message) {
    const fetch = (await import('node-fetch')).default;

    await fetch(webhookURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
    })
    .then(res => res.json())
    .then(json => console.log("Mensagem enviada ao webhook:", json))
    .catch(err => console.error("Erro ao enviar webhook:", err));
}

module.exports = (client) => {
    console.log(`[LOAD] Error System`.green);

    process.on("uncaughtException", (err) => {
        const message = `Uncaught Exception: ${err.message}\n${err.stack}`;
        console.log(message);
        sendToWebhook(message);
    });

    process.on("unhandledRejection", (reason, promise) => {
        const message = `[GRAVE] Rejeição possivelmente não tratada em: Promise ${promise}\nMotivo: ${reason?.message || reason || 'Motivo não informado'}`;
        console.log(message);
        sendToWebhook(message);
    });
};