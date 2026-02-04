import { clamp, sign } from "./math";
import { Block, DropResult, EngineConfig, EngineState, GameMode, OverhangPiece } from "./types";

let blockId = 1;

const nextId = () => {
  blockId += 1;
  return blockId;
};

export const createEngineState = (
  config: EngineConfig,
  mode: GameMode,
  heightTarget?: number,
): EngineState => {
  blockId = 1;
  const baseBlock: Block = {
    id: blockId,
    x: 0,
    y: 0,
    width: config.startWidth,
    height: config.blockHeight,
  };

  const active: Block = {
    id: nextId(),
    x: -config.startWidth,
    y: config.blockHeight,
    width: config.startWidth,
    height: config.blockHeight,
  };

  return {
    status: "idle",
    mode,
    blocks: [baseBlock],
    active,
    overhangs: [],
    time: 0,
    score: {
      score: 0,
      height: 1,
      perfects: 0,
      combo: 0,
      maxCombo: 0,
    },
    speed: config.baseSpeed,
    perfectTolerance: config.perfectTolerance,
    heightTarget,
  };
};

export const stepEngine = (state: EngineState, delta: number, config: EngineConfig) => {
  if (state.status !== "playing") {
    return;
  }
  const direction = sign(Math.sin(state.time * 0.001));
  state.active.x += direction * state.speed * delta * 0.001;
  state.time += delta;

  const rampSpeed = config.baseSpeed + state.blocks.length * config.speedRamp * config.baseSpeed;
  state.speed = clamp(rampSpeed, config.baseSpeed, config.maxSpeed);
  state.perfectTolerance = Math.max(
    2,
    config.perfectTolerance + state.blocks.length * config.toleranceRamp,
  );
};

export const dropBlock = (state: EngineState, config: EngineConfig): DropResult => {
  if (state.status !== "playing") {
    return {
      isPerfect: false,
      isGameOver: false,
      didLevelComplete: false,
    };
  }

  const prev = state.blocks[state.blocks.length - 1];
  const overhang = state.active.x - prev.x;
  const isPerfect = Math.abs(overhang) <= state.perfectTolerance;
  const overlap = isPerfect ? state.active.width : state.active.width - Math.abs(overhang);

  if (overlap <= 0) {
    state.status = "gameover";
    return {
      isPerfect: false,
      isGameOver: true,
      didLevelComplete: false,
    };
  }

  const alignedX = isPerfect ? prev.x : state.active.x - overhang * 0.5;
  const trimmedBlock: Block = {
    id: state.active.id,
    x: isPerfect ? prev.x : alignedX,
    y: state.active.y,
    width: overlap,
    height: state.active.height,
  };

  const overhangWidth = Math.abs(overhang);
  const overhangPiece: OverhangPiece | undefined = !isPerfect && overhangWidth > 0
    ? {
        id: nextId(),
        x:
          overhang > 0
            ? trimmedBlock.x + overlap * 0.5 + overhangWidth * 0.5
            : trimmedBlock.x - overlap * 0.5 - overhangWidth * 0.5,
        y: trimmedBlock.y,
        width: overhangWidth,
        height: trimmedBlock.height,
        direction: overhang > 0 ? "right" : "left",
        rotation: 0,
      }
    : undefined;

  state.blocks.push(trimmedBlock);
  state.active = {
    id: nextId(),
    x: -config.startWidth,
    y: trimmedBlock.y + config.blockHeight,
    width: trimmedBlock.width,
    height: trimmedBlock.height,
  };

  state.score.height = state.blocks.length;
  state.score.score += 1;

  if (isPerfect) {
    state.score.perfects += 1;
    state.score.combo = clamp(state.score.combo + 1, 0, config.comboCap);
    state.score.maxCombo = Math.max(state.score.maxCombo, state.score.combo);
    state.score.score += config.perfectBonus + state.score.combo * config.comboBonus;
  } else {
    state.score.combo = 0;
  }

  if (overhangPiece) {
    state.overhangs.push(overhangPiece);
  }

  const didLevelComplete = Boolean(
    state.heightTarget && state.score.height >= state.heightTarget,
  );

  if (didLevelComplete && state.mode === "levels") {
    state.status = "levelcomplete";
  }

  return {
    overhang: overhangPiece,
    isPerfect,
    isGameOver: false,
    didLevelComplete,
  };
};
