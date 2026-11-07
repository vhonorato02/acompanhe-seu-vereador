// Renders the brand mark (src/app/icon.svg) into the PNG icons used by the manifest and iOS.
// Usage: node scripts/icones.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync("src/app/icon.svg", "utf8");
const marca = (lado) => sharp(Buffer.from(svg.replace('width="34" height="34"', `width="${lado}" height="${lado}"`))).png();

await marca(192).toFile("public/icones/icone-192.png");
await marca(512).toFile("public/icones/icone-512.png");
await marca(180).toFile("src/app/apple-icon.png");
// Maskable: full-bleed background with the glyph inside the 80% safe zone.
const glifo = svg.replace(/<rect[^>]*\/>/, "").replace('width="34" height="34"', 'width="360" height="360"');
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#1d1d1f" } })
  .composite([{ input: await sharp(Buffer.from(glifo)).png().toBuffer(), left: 76, top: 76 }])
  .png()
  .toFile("public/icones/icone-maskable-512.png");
console.log("ícones gerados");
