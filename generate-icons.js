import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function drawIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient
      const bgProgress = (x + y) / (size * 2);
      let r = 7 + Math.floor(bgProgress * 15);
      let g = 9 + Math.floor(bgProgress * 10);
      let b = 19 + Math.floor(bgProgress * 25);
      let a = 255;

      if (!isMaskable && dist > radius + 4) {
        // Transparent outside circular badge for standard icon
        a = 0;
      } else {
        // Glowing ring
        if (Math.abs(dist - radius) < size * 0.04) {
          r = 255;
          g = 42;
          b = 133;
        } else if (dist < radius) {
          // Inner glowing core
          const coreDist = dist / radius;
          if (coreDist < 0.6) {
            // Neon pink & cyan gradient
            const angle = Math.atan2(dy, dx);
            r = Math.min(255, Math.floor(180 + Math.sin(angle) * 75));
            g = Math.min(255, Math.floor(60 + Math.cos(angle) * 120));
            b = Math.min(255, Math.floor(220 + Math.cos(angle) * 35));
          }
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return png;
}

const icons = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: true },
];

for (const icon of icons) {
  const filePath = path.resolve('public', icon.name);
  const png = drawIcon(icon.size, icon.maskable);
  png.pack().pipe(fs.createWriteStream(filePath)).on('finish', () => {
    console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
  });
}
