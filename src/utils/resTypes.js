const { EmbedBuilder } = require("discord.js");
const { resTypes } = require('../config.json');

const res = Object.create(
    {},
    Object.entries(resTypes).reduce((obj, [name, { color, emoji }]) => {
        obj[name] = {
            enumerable: true,
            writable: false,
            value(description, options = {}) {
                const embed = new EmbedBuilder()
                    .setDescription(`${emoji} ${description}`)
                    .setColor(color);

                if (options.title) {
                    embed.setTitle(options.title);
                }

                if (options.showTime) {
                    embed.setTimestamp();
                }

                if (options.embeds && Array.isArray(options.embeds)) {
                    const pos = options.position || "unshift";
                    options.embeds = [...options.embeds];
                    options.embeds[pos === "push" ? "push" : "unshift"](embed);
                }

                const defaults = {
                    embeds: [embed],
                    ephemeral: true,
                };

                return Object.assign(defaults, options);
            }
        };
        return obj;
    }, {})
);

module.exports = res;