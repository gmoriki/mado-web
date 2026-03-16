import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 160;
const BRAND_COLOR = "#0d9488"; // teal-600

// Create SVG overlay with text
const svgOverlay = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&amp;display=swap');
  </style>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f8fafb"/>
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${BRAND_COLOR}"/>
  <text x="${WIDTH / 2}" y="420" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="56" fill="#1a1a2e">
    mado web
  </text>
  <text x="${WIDTH / 2}" y="480" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="26" fill="#64748b">
    AI&#x306E;&#x56DE;&#x7B54;&#x3092;&#x3001;&#x305D;&#x306E;&#x307E;&#x307E;&#x5171;&#x6709;&#x30EA;&#x30F3;&#x30AF;&#x306B;
  </text>
  <text x="${WIDTH / 2}" y="580" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="18" fill="#94a3b8">
    mado-web.com
  </text>
</svg>`;

// Compose: background SVG + logo overlay
const bgBuffer = Buffer.from(svgOverlay);
const logoPath = path.join(root, "public", "icon-512.png");
const outputPath = path.join(root, "public", "og-image.png");

const logo = await sharp(logoPath)
  .resize(LOGO_SIZE, LOGO_SIZE)
  .toBuffer();

await sharp(bgBuffer, { density: 150 })
  .resize(WIDTH, HEIGHT)
  .composite([
    {
      input: logo,
      top: Math.round((HEIGHT - LOGO_SIZE) / 2 - 100),
      left: Math.round((WIDTH - LOGO_SIZE) / 2),
    },
  ])
  .png()
  .toFile(outputPath);

console.log(`OG image generated: ${outputPath}`);
