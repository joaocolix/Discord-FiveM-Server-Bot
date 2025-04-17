const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: "dmcargo",
  description: "[FERRAMENTA] Envie uma mensagem no privado de um cargo.",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
        name: "cargo",
        description: "Mencione um cargo.",
        type: ApplicationCommandOptionType.Role,
        required: true,
    },
    {
        name: "mensagem",
        description: "Escreva algo para ser enviado.",
        type: ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: "formato",
        description: "Escolha o formato da mensagem privada (mensagem ou embed).",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: "mensagem",
                value: "mensagem"
            },
            {
                name: "embed",
                value: "embed"
            }
        ]
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.` });
        return;
    }
    
    await interaction.deferReply();

    let role = interaction.options.getRole("cargo");
    let msg = interaction.options.getString("mensagem");
    let formato = interaction.options.getString("formato");
    let members = role.members;
    let successfulMembers = [];
    let failedMembers = [];

    for (let [id, member] of members) {
      try {
        if (formato === "embed") {
          const embed = new EmbedBuilder()
            .setDescription(msg)
            .setColor(`#ffcc01`);
          await member.send({ embeds: [embed] });
        } else {
          await member.send({ content: msg });
        }
        successfulMembers.push(member.user.tag);
      } catch (e) {
        failedMembers.push(member.user.tag);
      }
    }

    let responseMessage = `Mensagem enviada para ${successfulMembers.length} membros.\n`;
    if (failedMembers.length > 0) {
      responseMessage += `Não consegui enviar para ${failedMembers.length} membros (DM fechada).`;
    }
    await interaction.editReply({ content: responseMessage });
  }
};