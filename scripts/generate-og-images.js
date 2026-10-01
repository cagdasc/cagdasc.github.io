import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure output dirs
const ogDir = path.join(rootDir, 'public', 'og');
if (!fs.existsSync(ogDir)) {
  fs.mkdirSync(ogDir, { recursive: true });
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine = 35) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// 1. Generate Home / CV Card
function generateCvSvg() {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#818CF8" stop-opacity="0.8" />
    </linearGradient>
    <radialGradient id="ambient" cx="80%" cy="20%" r="50%">
      <stop offset="0%" stop-color="#0284C7" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#0284C7" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#ambient)" />

  <!-- Subtle border container -->
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="#1E293B" stroke-width="2" />
  
  <!-- Decorative grid dots -->
  <g fill="#334155" opacity="0.3">
    <circle cx="950" cy="120" r="2"/><circle cx="990" cy="120" r="2"/><circle cx="1030" cy="120" r="2"/>
    <circle cx="950" cy="160" r="2"/><circle cx="990" cy="160" r="2"/><circle cx="1030" cy="160" r="2"/>
    <circle cx="950" cy="200" r="2"/><circle cx="990" cy="200" r="2"/><circle cx="1030" cy="200" r="2"/>
  </g>

  <!-- Top badge -->
  <g transform="translate(100, 110)">
    <rect width="260" height="40" rx="20" fill="#0369A1" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5" />
    <text x="130" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#38BDF8" text-anchor="middle" letter-spacing="1.5">SENIOR ANDROID DEVELOPER</text>
  </g>

  <!-- Main Name & Title -->
  <text x="100" y="240" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="68" font-weight="800" fill="#F8FAFC" letter-spacing="-1">
    Cagdas Caglak
  </text>
  
  <text x="100" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500" fill="#94A3B8">
    Senior Lead Software Engineer at <tspan fill="#38BDF8" font-weight="600">J.P. Morgan (Nutmeg)</tspan>
  </text>

  <!-- Description paragraph -->
  <text x="100" y="370" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#CBD5E1">
    Specializing in Jetpack Compose, Kotlin Multiplatform, Clean Architecture,
  </text>
  <text x="100" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#CBD5E1">
    and AI-assisted developer tooling.
  </text>

  <!-- Tech tags -->
  <g transform="translate(100, 460)">
    <rect x="0" y="0" width="90" height="34" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="45" y="22" font-family="monospace" font-size="14" fill="#E2E8F0" text-anchor="middle">Kotlin</text>

    <rect x="105" y="0" width="160" height="34" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="185" y="22" font-family="monospace" font-size="14" fill="#E2E8F0" text-anchor="middle">Jetpack Compose</text>

    <rect x="280" y="0" width="180" height="34" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="370" y="22" font-family="monospace" font-size="14" fill="#E2E8F0" text-anchor="middle">Kotlin Multiplatform</text>

    <rect x="475" y="0" width="110" height="34" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="530" y="22" font-family="monospace" font-size="14" fill="#E2E8F0" text-anchor="middle">Paparazzi</text>

    <rect x="600" y="0" width="110" height="34" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="655" y="22" font-family="monospace" font-size="14" fill="#E2E8F0" text-anchor="middle">AI Agents</text>
  </g>

  <!-- Bottom bar -->
  <rect x="100" y="520" width="1000" height="1" fill="#1E293B" />
  
  <text x="100" y="555" font-family="monospace" font-size="16" fill="#64748B">
    cagdas.caglak.cc
  </text>
  <text x="1100" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" fill="#64748B" text-anchor="end">
    London, United Kingdom
  </text>
</svg>`;
}

// 2. Generate Blog Post Card
function generatePostSvg(post) {
  const titleLines = wrapText(post.title, 28);
  const summaryLines = wrapText(post.summary, 50).slice(0, 3);

  let titleTspans = '';
  let startY = 220;
  if (titleLines.length > 2) startY = 195;

  titleLines.forEach((line, index) => {
    titleTspans += `<tspan x="100" y="${startY + (index * 68)}">${escapeXml(line)}</tspan>\n`;
  });

  const summaryStartY = startY + (titleLines.length * 68) + 25;
  let summaryTspans = '';
  summaryLines.forEach((line, index) => {
    summaryTspans += `<tspan x="100" y="${summaryStartY + (index * 32)}">${escapeXml(line)}</tspan>\n`;
  });

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgPost" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080E1A" />
      <stop offset="60%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <radialGradient id="glowPost" cx="15%" cy="85%" r="55%">
      <stop offset="0%" stop-color="#0284C7" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#0284C7" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowTop" cx="85%" cy="15%" r="50%">
      <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#4F46E5" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgPost)" />
  <rect width="1200" height="630" fill="url(#glowPost)" />
  <rect width="1200" height="630" fill="url(#glowTop)" />

  <!-- Frame outline -->
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="#1E293B" stroke-width="2" />

  <!-- Top category pill -->
  <g transform="translate(100, 95)">
    <rect width="320" height="38" rx="19" fill="#0284C7" fill-opacity="0.15" stroke="#38BDF8" stroke-width="1.5" />
    <text x="160" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1.2">
      ${escapeXml(post.category.toUpperCase())}
    </text>
  </g>

  <!-- Post Title -->
  <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800" fill="#F8FAFC" letter-spacing="-1">
    ${titleTspans}
  </text>

  <!-- Post Summary -->
  <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94A3B8" letter-spacing="0.2">
    ${summaryTspans}
  </text>

  <!-- Bottom Brand Divider & Info -->
  <rect x="100" y="515" width="1000" height="1" fill="#1E293B" />

  <g transform="translate(100, 545)">
    <!-- Author icon or bullet -->
    <circle cx="8" cy="8" r="8" fill="#38BDF8" />
    <text x="28" y="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#F1F5F9">
      Cagdas Caglak
    </text>
    <text x="155" y="13" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#64748B">
      •  Senior Android Developer
    </text>
  </g>

  <text x="1100" y="558" font-family="monospace" font-size="16" font-weight="500" fill="#38BDF8" text-anchor="end">
    cagdas.caglak.cc/blog
  </text>
</svg>`;
}

// 3. Blog List Card
function generateBlogListSvg() {
  return generatePostSvg({
    title: 'Technical Engineering Blog',
    summary: 'A collection of deep-dive articles on Android architecture, Kotlin Multiplatform, automated testing with Paparazzi, and LLM AI agents.',
    category: 'Engineering & Architecture'
  });
}

// Convert SVG to PNG using ffmpeg (built with librsvg)
function convertSvgToPng(svgString, outputPngPath) {
  const tempSvgPath = outputPngPath.replace(/\.png$/, '.temp.svg');
  fs.writeFileSync(tempSvgPath, svgString, 'utf8');
  try {
    execSync(`ffmpeg -y -i "${tempSvgPath}" "${outputPngPath}" 2>/dev/null`);
    console.log(`Generated: ${path.relative(rootDir, outputPngPath)}`);
  } catch (err) {
    console.error(`Failed to convert SVG to PNG for ${outputPngPath}:`, err.message);
  } finally {
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath);
    }
  }
}

// Main execution
console.log('Generating OpenGraph images...');
convertSvgToPng(generateCvSvg(), path.join(ogDir, 'cv.png'));
convertSvgToPng(generateBlogListSvg(), path.join(ogDir, 'blog.png'));

// Post specific: agent-behind-the-emulator
const postData = {
  title: 'The Agent Behind the Emulator',
  summary: 'A journey from giving an LLM tools to control an emulator to understanding the architecture needed to make an agent reliably interact with and test real applications.',
  category: 'AI Agent, Testing & Tooling'
};
convertSvgToPng(generatePostSvg(postData), path.join(ogDir, 'agent-behind-the-emulator.png'));

console.log('OpenGraph images generated successfully!');
