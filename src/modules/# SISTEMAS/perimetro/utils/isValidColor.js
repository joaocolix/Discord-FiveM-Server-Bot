function isValidColor(input) {
    const hex6 = /^#?[0-9A-Fa-f]{6}$/;
    const hex8 = /^#?[0-9A-Fa-f]{8}$/;
    const rgb = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;

    return hex6.test(input) || hex8.test(input) || rgb.test(input);
}

module.exports = isValidColor;