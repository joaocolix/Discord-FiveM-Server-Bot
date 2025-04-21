module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.run(client, interaction);
        } catch (error) {
            console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
            await interaction.reply({ 
                content: "Ocorreu um erro ao executar o comando.", 
                flags: 1 << 6 
            }).catch(console.error);
        }
    });
};