import balanceJson from "./gameBalance.json";
import levelsJson from "./levels.json";
import skinsJson from "./skins.json";

export type GameBalance = {
  baseSpeed: number;
  maxSpeed: number;
  speedRamp: number;
  perfectToleranceBase: number;
  toleranceRamp: number;
  blockHeight: number;
  startWidth: number;
  minWidth: number;
  cameraSmooth: number;
  shakeStrength: number;
  comboCap: number;
  perfectBonus: number;
  comboBonus: number;
  gravity: number;
  overhangFallSpeed: number;
  particleCount: number;
};

export type LevelConfig = {
  id: string;
  name: string;
  heightTarget: number;
  startWidth?: number;
  baseSpeed?: number;
  speedRamp?: number;
  perfectTolerance?: number;
  comboForThreeStars?: number;
};

export type SkinConfig = {
  id: string;
  name: string;
  colors: {
    stack: string;
    active: string;
    background: string;
    glow: string;
  };
  particles: {
    color: string;
    size: number;
  };
  soundSetId?: string;
  unlock: {
    type: "free" | "bestScore" | "perfects";
    value?: number;
  };
};

const defaultBalance: GameBalance = {
  baseSpeed: 120,
  maxSpeed: 360,
  speedRamp: 0.015,
  perfectToleranceBase: 6,
  toleranceRamp: -0.01,
  blockHeight: 22,
  startWidth: 180,
  minWidth: 40,
  cameraSmooth: 0.12,
  shakeStrength: 10,
  comboCap: 8,
  perfectBonus: 2,
  comboBonus: 1,
  gravity: 520,
  overhangFallSpeed: 220,
  particleCount: 140,
};

const fallbackLevel: LevelConfig[] = [
  {
    id: "level-1",
    name: "Warmup",
    heightTarget: 10,
    comboForThreeStars: 3,
  },
];

const fallbackSkins: SkinConfig[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      stack: "#5EEAD4",
      active: "#22D3EE",
      background: "#0B0B12",
      glow: "#A7F3D0",
    },
    particles: {
      color: "#5EEAD4",
      size: 3,
    },
    unlock: { type: "free" },
  },
];

const toNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toNumberOptional = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const toString = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;

const toArray = <T>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;

const parseBalance = (value: unknown): GameBalance => {
  const raw = typeof value === "object" && value ? (value as GameBalance) : ({} as GameBalance);
  return {
    baseSpeed: toNumber(raw.baseSpeed, defaultBalance.baseSpeed),
    maxSpeed: toNumber(raw.maxSpeed, defaultBalance.maxSpeed),
    speedRamp: toNumber(raw.speedRamp, defaultBalance.speedRamp),
    perfectToleranceBase: toNumber(
      raw.perfectToleranceBase,
      defaultBalance.perfectToleranceBase,
    ),
    toleranceRamp: toNumber(raw.toleranceRamp, defaultBalance.toleranceRamp),
    blockHeight: toNumber(raw.blockHeight, defaultBalance.blockHeight),
    startWidth: toNumber(raw.startWidth, defaultBalance.startWidth),
    minWidth: toNumber(raw.minWidth, defaultBalance.minWidth),
    cameraSmooth: toNumber(raw.cameraSmooth, defaultBalance.cameraSmooth),
    shakeStrength: toNumber(raw.shakeStrength, defaultBalance.shakeStrength),
    comboCap: toNumber(raw.comboCap, defaultBalance.comboCap),
    perfectBonus: toNumber(raw.perfectBonus, defaultBalance.perfectBonus),
    comboBonus: toNumber(raw.comboBonus, defaultBalance.comboBonus),
    gravity: toNumber(raw.gravity, defaultBalance.gravity),
    overhangFallSpeed: toNumber(raw.overhangFallSpeed, defaultBalance.overhangFallSpeed),
    particleCount: toNumber(raw.particleCount, defaultBalance.particleCount),
  };
};

const parseLevels = (value: unknown): LevelConfig[] => {
  const rawLevels = toArray<LevelConfig>(value, fallbackLevel);
  return rawLevels.map((level, index) => ({
    id: toString(level.id, `level-${index + 1}`),
    name: toString(level.name, `Level ${index + 1}`),
    heightTarget: toNumber(level.heightTarget, 10),
    startWidth: toNumberOptional(level.startWidth),
    baseSpeed: toNumberOptional(level.baseSpeed),
    speedRamp: toNumberOptional(level.speedRamp),
    perfectTolerance: toNumberOptional(level.perfectTolerance),
    comboForThreeStars: toNumber(level.comboForThreeStars, 3),
  }));
};

const parseSkins = (value: unknown): SkinConfig[] => {
  const rawSkins = toArray<SkinConfig>(value, fallbackSkins);
  return rawSkins.map((skin, index) => ({
    id: toString(skin.id, `skin-${index + 1}`),
    name: toString(skin.name, `Skin ${index + 1}`),
    colors: {
      stack: toString(skin.colors?.stack, "#5EEAD4"),
      active: toString(skin.colors?.active, "#22D3EE"),
      background: toString(skin.colors?.background, "#0B0B12"),
      glow: toString(skin.colors?.glow, "#A7F3D0"),
    },
    particles: {
      color: toString(skin.particles?.color, "#5EEAD4"),
      size: toNumber(skin.particles?.size, 3),
    },
    soundSetId: skin.soundSetId,
    unlock: skin.unlock ?? { type: "free" },
  }));
};

export const gameBalance = parseBalance(balanceJson);
export const levels = parseLevels(levelsJson);
export const skins = parseSkins(skinsJson);
