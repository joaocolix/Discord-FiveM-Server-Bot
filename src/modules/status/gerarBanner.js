const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

registerFont(path.join(__dirname, './assets/fonts/Sora-Bold.ttf'), {
  family: 'Sora',
  weight: 'bold',
});
  
async function gerarBanner({ status = 'offline', jogadores = 'Carregando...', reinicio = 'Calculando...' }) {
    const statusColorMap = {
    online: '#00FF47',
    offline: '#FF3333',
    manutenção: '#FFD700',
    carregando: '#00C8FF',
    };

    const width = 260;
    const height = 60;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const svgPath = path.join(__dirname, './assets/svg/borda.svg');
    let svgData = fs.readFileSync(svgPath, 'utf8');
    const corSVG = statusColorMap[status.toLowerCase()] || '#FFFFFF';
    svgData = svgData.replace(/fill="#[0-9a-fA-F]{6}"/g, `fill="${corSVG}"`);
    const svgImage = await loadImage(Buffer.from(svgData));

    const svgX = (width - svgImage.width) / 2;
    const svgY = (height - svgImage.height) / 2;
    ctx.drawImage(svgImage, svgX, svgY);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Sora';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(status, width / 2, height / 2);  

    return canvas.toBuffer('image/png');
}

module.exports = { gerarBanner };
