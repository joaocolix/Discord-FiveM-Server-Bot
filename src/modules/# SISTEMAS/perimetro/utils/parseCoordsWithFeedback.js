function parseCoordsWithFeedback(rawText) {
    const lines = rawText.split('\n');
    const coords = [];
    const report = {
        total: lines.length,
        valid: 0,
        invalidLines: []
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let match = trimmed.match(
            /(?:vec(?:tor)?[23])?\(?\s*(-?\d+(\.\d+)?)\s*[,;\s]\s*(-?\d+(\.\d+)?)/i
        );

        if (!match) {
            match = trimmed.match(
                /x\s*=\s*(-?\d+(\.\d+)?)\s*,?\s*y\s*=\s*(-?\d+(\.\d+)?)/i
            );
            if (match) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[3]);

                if (!isNaN(x) && !isNaN(y)) {
                    coords.push([x, y]);
                    report.valid++;
                    return;
                }
            }
        } else {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[3]);

            if (!isNaN(x) && !isNaN(y)) {
                coords.push([x, y]);
                report.valid++;
                return;
            }
        }

        report.invalidLines.push({ line: index + 1, content: line });
    });

    return { coords, report };
}

module.exports = parseCoordsWithFeedback;