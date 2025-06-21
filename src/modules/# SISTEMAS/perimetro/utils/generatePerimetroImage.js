const { createCanvas } = require('canvas');

function parseColor(input, alpha = 1) {
    if (!input) return `rgba(0, 0, 0, ${alpha})`;

    if (input.startsWith('#')) {
        const hex = input.replace('#', '');

        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        if (hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const a = parseInt(hex.slice(6, 8), 16) / 255;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    }

    const rgbMatch = input.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return `rgba(0, 0, 0, ${alpha})`;
}

module.exports = async (coords, fillColor, borderColor, alpha) => {
    const width = 1276;
    const height = 1268;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    if (!coords.length) return canvas.toBuffer();

    const xs = coords.map(([x]) => x);
    const ys = coords.map(([, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 0;
    const scaleX = (width - 2 * padding) / (maxX - minX || 1);
    const scaleY = (height - 2 * padding) / (maxY - minY || 1);

    ctx.beginPath();
    coords.forEach(([x, y], i) => {
        const px = (x - minX) * scaleX + padding;
        const py = height - ((y - minY) * scaleY + padding);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.closePath();

    ctx.fillStyle = parseColor(fillColor, alpha);
    ctx.fill();

    ctx.strokeStyle = parseColor(borderColor, 1.0);
    ctx.lineWidth = 3.0;
    ctx.stroke();

    return canvas.toBuffer();
};