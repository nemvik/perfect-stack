import { createEngineState, dropBlock } from "@/game/engine/engine";
import { EngineConfig } from "@/game/engine/types";

const config: EngineConfig = {
  baseSpeed: 100,
  maxSpeed: 200,
  speedRamp: 0.01,
  perfectTolerance: 5,
  toleranceRamp: 0,
  blockHeight: 20,
  minWidth: 40,
  startWidth: 100,
  comboCap: 5,
  perfectBonus: 2,
  comboBonus: 1,
};

describe("engine drop", () => {
  it("calculates overlap and trims", () => {
    const state = createEngineState(config, "endless");
    state.status = "playing";
    const prev = state.blocks[state.blocks.length - 1];
    state.active.x = prev.x + 10;
    const result = dropBlock(state, config);
    expect(result.isGameOver).toBe(false);
    const last = state.blocks[state.blocks.length - 1];
    expect(last.width).toBe(90);
  });

  it("snaps perfect hits", () => {
    const state = createEngineState(config, "endless");
    state.status = "playing";
    const prev = state.blocks[state.blocks.length - 1];
    state.active.x = prev.x + 2;
    const result = dropBlock(state, config);
    expect(result.isPerfect).toBe(true);
    const last = state.blocks[state.blocks.length - 1];
    expect(last.x).toBe(prev.x);
  });

  it("returns game over when no overlap", () => {
    const state = createEngineState(config, "endless");
    state.status = "playing";
    const prev = state.blocks[state.blocks.length - 1];
    state.active.x = prev.x + 120;
    const result = dropBlock(state, config);
    expect(result.isGameOver).toBe(true);
  });

  it("adds scoring for perfect combo", () => {
    const state = createEngineState(config, "endless");
    state.status = "playing";
    const prev = state.blocks[state.blocks.length - 1];
    state.active.x = prev.x;
    dropBlock(state, config);
    expect(state.score.score).toBeGreaterThan(1);
    expect(state.score.combo).toBe(1);
  });
});
