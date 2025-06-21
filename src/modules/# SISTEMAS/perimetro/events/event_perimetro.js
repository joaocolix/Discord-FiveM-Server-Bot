const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const client = require('../../../index');

const parseCoordsWithFeedback = require('../utils/parseCoordsWithFeedback');
const isValidColor = require('../utils/isValidColor');
const generatePerimetroImage = require('../utils/generatePerimetroImage');

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'open_perimetro_modal') {
      const modal = new ModalBuilder()
        .setCustomId('submit_perimetro_modal')
        .setTitle('Gerar Perímetro');

      const coordsInput = new TextInputBuilder()
        .setCustomId('coords')
        .setLabel('Coordenadas')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const fillColorInput = new TextInputBuilder()
        .setCustomId('fillcolor')
        .setLabel('Cor do Perímetro (HEX ou RGB)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const borderColorInput = new TextInputBuilder()
        .setCustomId('bordercolor')
        .setLabel('Cor da Borda (HEX ou RGB)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const alphaInput = new TextInputBuilder()
        .setCustomId('alpha')
        .setLabel('Transparência (0 a 100%)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(fillColorInput),
        new ActionRowBuilder().addComponents(borderColorInput),
        new ActionRowBuilder().addComponents(alphaInput),
        new ActionRowBuilder().addComponents(coordsInput)
      );

      await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'submit_perimetro_modal') {
        const rawCoords = interaction.fields.getTextInputValue('coords');
        const fillColor = interaction.fields.getTextInputValue('fillcolor');
        const borderColor = interaction.fields.getTextInputValue('bordercolor');
        const alphaInput = interaction.fields.getTextInputValue('alpha');

        const alpha = Math.max(0, Math.min(100, parseInt(alphaInput))) / 100;

        const { coords, report } = parseCoordsWithFeedback(rawCoords);

        if (!coords.length) {
            return await interaction.reply({
                content: 'Nenhuma coordenada válida foi encontrada. Verifique o formato das entradas.',
                ephemeral: true
            });
        }

        if (!isValidColor(fillColor) || !isValidColor(borderColor)) {
            return await interaction.reply({
                content: 'As cores precisam estar no formato HEX (ex: `#FF0000`, `FF0000`, `FF000080`) ou `rgb(r, g, b)`.',
                ephemeral: true
            });
        }

        if (coords.length > 1000) {
            return await interaction.reply({
                content: `Limite de 1000 coordenadas excedido (foram detectadas ${coords.length}).`,
                ephemeral: true
            });
        }

        try {
            const buffer = await generatePerimetroImage(coords, fillColor, borderColor, alpha);
            const attachment = new AttachmentBuilder(buffer, { name: 'perimetro.png' });

            await interaction.reply({
                files: [attachment],
                ephemeral: true
            });

            if (report.invalidLines.length > 0) {
                const invalidSummary = report.invalidLines
                    .slice(0, 5)
                    .map(l => `Linha ${l.line}: \`${l.content.slice(0, 100)}\``)
                    .join('\n');

                await interaction.followUp({
                    content: `Algumas linhas foram ignoradas por estarem mal formatadas:\n${invalidSummary}${report.invalidLines.length > 5 ? '\n...e mais linhas foram ignoradas.' : ''}`,
                    ephemeral: true
                });
            }
        } catch (err) {
            console.error('Erro ao gerar perímetro:', err);
            await interaction.reply({
                content: 'Erro ao processar as coordenadas.',
                ephemeral: true
            });
        }
    }
});