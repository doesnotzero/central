import sharp from "sharp";
import { readFileSync } from "node:fs";

const svg = readFileSync(new URL("../public/favicon.svg", import.meta.url));
const targets = [
  { size: 180, out: "apple-touch-icon.png" },
  { size: 192, out: "icon-192.png" },
  { size: 512, out: "icon-512.png" },
  { size: 32, out: "favicon-32.png" },
];

for (const { size, out } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(new URL(`../public/${out}`, import.meta.url).pathname);
  console.log(`ok ${out} (${size}px)`);
}
