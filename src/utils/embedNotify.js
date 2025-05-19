const { EmbedBuilder } = require("discord.js");

const types = {
    success: { color: 0x57F287, emoji: "✅" },
    error:   { color: 0xED4245, emoji: "❌" },
    warning: { color: 0xFEE75C, emoji: "⚠️" },
    info:    { color: 0x5865F2, emoji: "ℹ️" },
    default: { color: 0x2F3136, emoji: "📢" }
};

const res = Object.create(
    {},
    Object.entries(types).reduce((obj, [name, { color, emoji }]) => {
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