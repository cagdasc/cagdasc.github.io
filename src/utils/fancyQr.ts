import { qrcodegen } from './qrcodegen';

export type QrStyleTheme = 'indigo-flow' | 'emerald-matrix' | 'sunset-amber' | 'clean-slate';
export type QrDotShape = 'dots' | 'squircles' | 'blocks';

export interface FancyQrOptions {
  theme?: QrStyleTheme;
  dotShape?: QrDotShape;
  showCenterLogo?: boolean;
  size?: number;
}

export const QR_THEMES: {
  id: QrStyleTheme;
  name: string;
  preview: string;
  gradient: { start: string; end: string; angle: number };
  eyeColor: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    id: 'indigo-flow',
    name: 'Electric Indigo',
    preview: '#3B82F6',
    gradient: { start: '#2563EB', end: '#7C3AED', angle: 135 },
    eyeColor: '#1D4ED8',
    bgColor: '#FFFFFF',
    textColor: '#1E293B',
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    preview: '#10B981',
    gradient: { start: '#059669', end: '#10B981', angle: 135 },
    eyeColor: '#047857',
    bgColor: '#FFFFFF',
    textColor: '#064E3B',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    preview: '#F59E0B',
    gradient: { start: '#D97706', end: '#E11D48', angle: 135 },
    eyeColor: '#B45309',
    bgColor: '#FFFFFF',
    textColor: '#78350F',
  },
  {
    id: 'clean-slate',
    name: 'Midnight Slate',
    preview: '#0F172A',
    gradient: { start: '#0F172A', end: '#334155', angle: 135 },
    eyeColor: '#020617',
    bgColor: '#FFFFFF',
    textColor: '#0F172A',
  },
];

export function generateFancyQrSvg(text: string, options: FancyQrOptions = {}): string {
  const {
    theme = 'indigo-flow',
    dotShape = 'dots',
    showCenterLogo = true,
    size = 320,
  } = options;

  const currentTheme = QR_THEMES.find((t) => t.id === theme) || QR_THEMES[0];

  // Encode with HIGH error correction to easily tolerate stylized eyes & center badge
  const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.HIGH);
  const qrSize = qr.size;

  const margin = 4;
  const totalGridSize = qrSize + margin * 2;
  const cellSize = size / totalGridSize;

  const isFinderPattern = (r: number, c: number): boolean => {
    // Top-left
    if (r < 7 && c < 7) return true;
    // Top-right
    if (r < 7 && c >= qrSize - 7) return true;
    // Bottom-left
    if (r >= qrSize - 7 && c < 7) return true;
    return false;
  };

  // Center zone for logo (if enabled)
  const centerRadius = showCenterLogo ? Math.floor(qrSize * 0.16) : 0;
  const centerCoord = Math.floor(qrSize / 2);
  const isCenterZone = (r: number, c: number): boolean => {
    if (!showCenterLogo) return false;
    return Math.abs(r - centerCoord) <= centerRadius && Math.abs(c - centerCoord) <= centerRadius;
  };

  let bodyModules = '';

  for (let r = 0; r < qrSize; r++) {
    for (let c = 0; c < qrSize; c++) {
      if (isFinderPattern(r, c) || isCenterZone(r, c)) continue;

      if (qr.getModule(r, c)) {
        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;

        if (dotShape === 'dots') {
          // Circular rounded dot with slight margin
          const radius = cellSize * 0.42;
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          bodyModules += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="url(#qr-gradient)" />`;
        } else if (dotShape === 'squircles') {
          // Rounded rect
          const padding = cellSize * 0.08;
          const w = cellSize - padding * 2;
          const rx = cellSize * 0.28;
          bodyModules += `<rect x="${(x + padding).toFixed(2)}" y="${(y + padding).toFixed(2)}" width="${w.toFixed(2)}" height="${w.toFixed(2)}" rx="${rx.toFixed(2)}" fill="url(#qr-gradient)" />`;
        } else {
          // Classic sharp crisp block
          bodyModules += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="url(#qr-gradient)" />`;
        }
      }
    }
  }

  // Generate stylized finder eye patterns (at 3 corners)
  const renderEye = (gridRow: number, gridCol: number) => {
    const x = (gridCol + margin) * cellSize;
    const y = (gridRow + margin) * cellSize;
    const eyeOuterWidth = 7 * cellSize;
    const eyeInnerWidth = 3 * cellSize;
    const eyeInnerOffset = 2 * cellSize;
    const outerRx = dotShape === 'blocks' ? 0 : cellSize * 1.8;
    const innerRx = dotShape === 'blocks' ? 0 : cellSize * 1.0;

    return `
      <!-- Outer Ring -->
      <rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${eyeOuterWidth.toFixed(2)}" height="${eyeOuterWidth.toFixed(2)}" rx="${outerRx.toFixed(2)}" fill="${currentTheme.eyeColor}" />
      <rect x="${(x + cellSize).toFixed(2)}" y="${(y + cellSize).toFixed(2)}" width="${(5 * cellSize).toFixed(2)}" height="${(5 * cellSize).toFixed(2)}" rx="${(outerRx * 0.7).toFixed(2)}" fill="${currentTheme.bgColor}" />
      <!-- Inner Pupil -->
      <rect x="${(x + eyeInnerOffset).toFixed(2)}" y="${(y + eyeInnerOffset).toFixed(2)}" width="${eyeInnerWidth.toFixed(2)}" height="${eyeInnerWidth.toFixed(2)}" rx="${innerRx.toFixed(2)}" fill="url(#qr-gradient)" />
    `;
  };

  const eyes = `
    ${renderEye(0, 0)}
    ${renderEye(0, qrSize - 7)}
    ${renderEye(qrSize - 7, 0)}
  `;

  // Center logo badge (if enabled)
  let centerLogoSvg = '';
  if (showCenterLogo) {
    const badgeSize = (centerRadius * 2 + 1.2) * cellSize;
    const badgeX = (centerCoord - centerRadius + margin - 0.1) * cellSize;
    const badgeY = (centerCoord - centerRadius + margin - 0.1) * cellSize;
    const badgeRadius = badgeSize / 2;
    const centerPointX = badgeX + badgeRadius;
    const centerPointY = badgeY + badgeRadius;

    centerLogoSvg = `
      <!-- Center Emblem Backdrop -->
      <circle cx="${centerPointX.toFixed(2)}" cy="${centerPointY.toFixed(2)}" r="${badgeRadius.toFixed(2)}" fill="${currentTheme.bgColor}" stroke="${currentTheme.eyeColor}" stroke-width="${(cellSize * 0.6).toFixed(2)}" />
      <circle cx="${centerPointX.toFixed(2)}" cy="${centerPointY.toFixed(2)}" r="${(badgeRadius - cellSize * 0.8).toFixed(2)}" fill="url(#qr-gradient)" />
      <!-- Center Monogram 'ÇÇ' -->
      <text x="${centerPointX.toFixed(2)}" y="${(centerPointY + cellSize * 1.1).toFixed(2)}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${(badgeSize * 0.36).toFixed(2)}" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5px">ÇÇ</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${currentTheme.gradient.start}" />
        <stop offset="100%" stop-color="${currentTheme.gradient.end}" />
      </linearGradient>
    </defs>
    <!-- Background Card -->
    <rect width="${size}" height="${size}" rx="24" fill="${currentTheme.bgColor}" />
    <!-- QR Data Modules -->
    ${bodyModules}
    <!-- Stylized Finder Eyes -->
    ${eyes}
    <!-- Center Monogram -->
    ${centerLogoSvg}
  </svg>`;

  return svg;
}

export function generateFancyQrDataUrl(text: string, options: FancyQrOptions = {}): string {
  const svg = generateFancyQrSvg(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
