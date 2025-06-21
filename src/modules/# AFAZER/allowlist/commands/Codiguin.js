const path = require('path');
const fs = require('fs');
const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const codesFilePath = path.resolve(__dirname, '../database/json/codes.json');

module.exports = {
    name: "gerar-codiguin",
    description: "[ADM] Gerar codiguins de liberação.",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "quantity",
        description: "Quantia para gerar.",
        type: ApplicationCommandOptionType.Integer,
        required: true,
      }
    ],
  
    run: async (client, interaction) => {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
          return interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, flags: 1 << 6 });
      } else {
          const quantity = interaction.options.getInteger("quantity");
          let codesData = JSON.parse(fs.readFileSync(codesFilePath, 'utf8'));
          let newCodes = [];
  
          for (let i = 0; i < quantity; i++) {
              let newCode = generateUniqueCode();
              codesData[newCode] = { usedBy: null };
              newCodes.push(newCode);
          }
  
          fs.writeFileSync(codesFilePath, JSON.stringify(codesData, null, 2));

          const embed = new EmbedBuilder()
          .setTitle('Códigos Gerados')
          .setColor('#ffcc01')
          .setDescription(`**${quantity} GERADOS**\n\`\`\`${newCodes.join('\n')}\`\`\``)

          interaction.reply({ embeds: [embed], flags: 1 << 6 });
      }
    }
  };
  
  function generateUniqueCode() {
      return Math.random().toString(36).substr(2, 8);
  }