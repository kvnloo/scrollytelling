const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public/images');
const count = 120;

// A simple 1x1 black webp pixel base64
const base64WebP = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
const buffer = Buffer.from(base64WebP, 'base64');

console.log(`Generating ${count} placeholder images in ${dir}...`);

for (let i = 0; i < count; i++) {
  const paddedIndex = String(i).padStart(3, '0'); // 000, 001, ...
  const filename = `frame_${paddedIndex}_delay-0.04s.webp`;
  fs.writeFileSync(path.join(dir, filename), buffer);
}

console.log('Done.');
