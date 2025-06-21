const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'perimetro',
  description: 'Gerar imagem de perímetro',

  run: async (client, interaction) => {
    const button = new ButtonBuilder()
      .setCustomId('open_perimetro_modal')
      .setLabel('Gerar Perímetro')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      components: [row]
    });
  }
};
