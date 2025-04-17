// const webhookURL = 'https://discord.com/api/webhooks/1282091921224896676/91oA78mfe_h7_eMP3U4gHRPNOHPeSXUV5Quw1Q0CDYbzOwvSnNKQF9X6A7t1pqbINVkm';

// function sendToWebhook(message) {
//     fetch(webhookURL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             content: message, 
//         }),
//     })
//     .then(res => res.json())
//     .then(json => console.log("Mensagem enviada ao webhook:", json))
//     .catch(err => console.error("Erro ao enviar webhook:", err));
// }

// module.exports = (client) => {
//     console.log(`[LOAD] Error System`.green);

//     process.on("uncaughtException", (err) => {
//         const message = `Uncaught Exception: ${err.message}\n${err.stack}`;
//         console.log(message);
//         sendToWebhook(message);
//     });

//     process.on("unhandledRejection", (reason, promise) => {
//         const message = `[GRAVE] Rejeição possivelmente não tratada em: Promise ${promise}\nMotivo: ${reason?.message || reason || 'Motivo não informado'}`;
//         console.log(message);
//         sendToWebhook(message);
//     });
// };