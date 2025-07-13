const sharp = require('sharp');
const path = require('path');

async function createRoundedIcon() {
  try {
    // Читаем исходную иконку
    const inputPath = path.join(__dirname, '../build/icon.png');
    const outputPath = path.join(__dirname, '../build/icon-rounded.png');
    
    // Создаем круглую маску
    const size = 256;
    const radius = size / 2;
    
    // Создаем круглую маску
    const mask = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${size}" height="${size}">
          <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/>
        </svg>
      `),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

    // Применяем маску к исходной иконке
    await sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: mask,
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);

    console.log('✅ Скругленная иконка создана: build/icon-rounded.png');
    
    // Создаем также версию с меньшим радиусом скругления
    const roundedPath = path.join(__dirname, '../build/icon-rounded-corners.png');
    
    const roundedMask = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{
      input: Buffer.from(`
        <svg width="${size}" height="${size}">
          <rect width="${size}" height="${size}" rx="32" ry="32" fill="white"/>
        </svg>
      `),
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: roundedMask,
        blend: 'dest-in'
      }])
      .png()
      .toFile(roundedPath);

    console.log('✅ Иконка со скругленными углами создана: build/icon-rounded-corners.png');
    
  } catch (error) {
    console.error('❌ Ошибка при создании скругленной иконки:', error);
  }
}

createRoundedIcon(); 