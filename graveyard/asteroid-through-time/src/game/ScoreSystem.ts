import { GAME_CONFIG } from './GameConfig';

export interface EraInfo {
  era: string;
  epoch: string;
  accentColor: string;
  bgColor: string;
}

export function calculateScoreYears(distancePx: number, yearsPerUnit: number = GAME_CONFIG.YEARS_PER_WORLD_UNIT): number {
  if (distancePx <= 0 || isNaN(distancePx)) return 0;
  return Math.floor(distancePx * yearsPerUnit);
}

export function formatYears(years: number): string {
  const safeYears = Math.max(0, Math.floor(years || 0));
  return new Intl.NumberFormat('en-US').format(safeYears) + ' YEARS';
}

export function formatYearsCompact(years: number): string {
  const safeYears = Math.max(0, Math.floor(years || 0));
  if (safeYears >= 1_000_000) {
    return (safeYears / 1_000_000).toFixed(1) + 'M YRS';
  }
  if (safeYears >= 1_000) {
    return (safeYears / 1_000).toFixed(0) + 'K YRS';
  }
  return `${safeYears} YRS`;
}

export function getEraInfo(years: number): EraInfo {
  if (years < 2_580_000) {
    return {
      era: 'QUATERNARY SHIFT',
      epoch: 'Present / Ice Age Horizon',
      accentColor: '#38bdf8', // Sky blue
      bgColor: '#070f1e'
    };
  }
  if (years < 23_030_000) {
    return {
      era: 'NEOGENE CORRIDOR',
      epoch: 'Miocene Grassland Anomaly',
      accentColor: '#a78bfa', // Lavender
      bgColor: '#0d0a21'
    };
  }
  if (years < 66_000_000) {
    return {
      era: 'PALEOGENE EXPANSE',
      epoch: 'Pre-Extinction Threshold',
      accentColor: '#f472b6', // Pink
      bgColor: '#16081e'
    };
  }
  if (years < 145_000_000) {
    return {
      era: 'CRETACEOUS VOID',
      epoch: 'T-Rex & Ceratopsian Domain',
      accentColor: '#fb923c', // Warm amber / orange
      bgColor: '#1c0c08'
    };
  }
  if (years < 201_300_000) {
    return {
      era: 'JURASSIC RIFT',
      epoch: 'Giant Sauropod Orbit',
      accentColor: '#facc15', // Amber gold
      bgColor: '#181406'
    };
  }
  if (years < 251_900_000) {
    return {
      era: 'TRIASSIC CHASM',
      epoch: 'Dawn of Archosaurs',
      accentColor: '#4ade80', // Toxic Emerald
      bgColor: '#08170e'
    };
  }
  return {
    era: 'PERMIAN ANOMALY',
    epoch: 'Primordial Pangaea Abyss',
    accentColor: '#e879f9', // Neon magenta
    bgColor: '#1c0624'
  };
}

export function getEndGameMessage(years: number, seed: number = 0): string {
  const messages = GAME_CONFIG.END_MESSAGES;
  if (years >= 65_000_000 && years < 68_000_000) {
    return "You survived 65 million years. The impact was inevitable.";
  }
  const index = Math.abs(Math.floor(seed + years / 5000)) % messages.length;
  return messages[index] || messages[0];
}
