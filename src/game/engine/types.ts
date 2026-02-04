export type Block = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OverhangPiece = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: "left" | "right";
  rotation: number;
};

export type GameMode = "endless" | "levels" | "daily";

export type GameStatus =
  | "idle"
  | "playing"
  | "gameover"
  | "levelcomplete";

export type ScoreState = {
  score: number;
  height: number;
  perfects: number;
  combo: number;
  maxCombo: number;
};

export type EngineState = {
  status: GameStatus;
  mode: GameMode;
  blocks: Block[];
  active: Block;
  overhangs: OverhangPiece[];
  time: number;
  score: ScoreState;
  speed: number;
  perfectTolerance: number;
  heightTarget?: number;
};

export type EngineConfig = {
  baseSpeed: number;
  maxSpeed: number;
  speedRamp: number;
  perfectTolerance: number;
  toleranceRamp: number;
  blockHeight: number;
  minWidth: number;
  startWidth: number;
  comboCap: number;
  perfectBonus: number;
  comboBonus: number;
};

export type DropResult = {
  overhang?: OverhangPiece;
  isPerfect: boolean;
  isGameOver: boolean;
  didLevelComplete: boolean;
};
