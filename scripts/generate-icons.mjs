import sharp from 'sharp';

/**
 * Generate PWA homescreen icons with "Unfair Bird Quiz" text
 * over a cropped mourning dove background.
 */

async function generateIcon(size, outputPath) {
  // Determine font sizes relative to icon size
  const titleSize = Math.round(size * 0.13);
  const subtitleSize = Math.round(size * 0.09);
  const padding = Math.round(size * 0.06);
  const cornerRadius = Math.round(size * 0.15);

  // Create the text overlay as SVG
  const svgOverlay = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="rounded">
        <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}"/>
      </clipPath>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgba(0,0,0,0.65)"/>
        <stop offset="50%" style="stop-color:rgba(0,0,0,0.35)"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.7)"/>
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffd700"/>
        <stop offset="100%" style="stop-color:#ff6b35"/>
      </linearGradient>
    </defs>
    <!-- Dark overlay for text readability -->
    <rect width="${size}" height="${size}" fill="url(#grad)" clip-path="url(#rounded)"/>
    <!-- Border -->
    <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="${cornerRadius}" ry="${cornerRadius}"
          fill="none" stroke="rgba(255,215,0,0.5)" stroke-width="3"/>
    <!-- Text group centered -->
    <text x="${size / 2}" y="${size * 0.33}" text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-weight="900"
          font-size="${titleSize}px" fill="#ffd700"
          letter-spacing="1">UNFAIR</text>
    <text x="${size / 2}" y="${size * 0.52}" text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-weight="900"
          font-size="${titleSize}px" fill="#ffd700"
          letter-spacing="1">BIRD</text>
    <text x="${size / 2}" y="${size * 0.71}" text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif" font-weight="900"
          font-size="${titleSize}px" fill="#ffffff"
          letter-spacing="1">QUIZ</text>
    <!-- Thin rule under text -->
    <line x1="${size * 0.3}" y1="${size * 0.78}" x2="${size * 0.7}" y2="${size * 0.78}"
          stroke="rgba(255,215,0,0.4)" stroke-width="1.5"/>
  </svg>`;

  // Process the mourning dove image: crop to square, focus on the head
  const birdImage = await sharp('public/images/mourdo.jpg')
    .resize(size, size, {
      fit: 'cover',
      position: 'top',
    })
    .toBuffer();

  // Composite the text overlay on top of the bird
  await sharp(birdImage)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`Generated: ${outputPath} (${size}x${size})`);
}

async function main() {
  await generateIcon(192, 'public/icon-192.png');
  await generateIcon(512, 'public/icon-512.png');
  await generateIcon(180, 'public/apple-touch-icon.png');
  console.log('All icons generated successfully!');
}

main().catch(console.error);
