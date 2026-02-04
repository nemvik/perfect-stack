import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { gameBalance, levels, skins } from "@/config";
import { createEngineState, dropBlock, stepEngine } from "@/game/engine/engine";
import { EngineConfig, EngineState, GameMode } from "@/game/engine/types";
import { GameCanvas } from "@/game/render/GameCanvas";
import { emitParticles, updateParticles, useScreenShake } from "@/game/render/effects";
import { useParticlePool } from "@/game/render/particles";
import { loadProgress, saveProgress, StoredProgress } from "@/game/storage/storage";
import { clamp, lerp } from "@/game/engine/math";
import { SeededRng, seedFromString } from "@/game/engine/rng";
import { getDateKey } from "@/utils/date";

const buildConfig = (mode: GameMode, levelId?: string) => {
  if (mode === "levels" && levelId) {
    const level = levels.find((item) => item.id === levelId);
    return {
      config: {
        baseSpeed: level?.baseSpeed ?? gameBalance.baseSpeed,
        maxSpeed: gameBalance.maxSpeed,
        speedRamp: level?.speedRamp ?? gameBalance.speedRamp,
        perfectTolerance: level?.perfectTolerance ?? gameBalance.perfectToleranceBase,
        toleranceRamp: gameBalance.toleranceRamp,
        blockHeight: gameBalance.blockHeight,
        minWidth: gameBalance.minWidth,
        startWidth: level?.startWidth ?? gameBalance.startWidth,
        comboCap: gameBalance.comboCap,
        perfectBonus: gameBalance.perfectBonus,
        comboBonus: gameBalance.comboBonus,
      },
      heightTarget: level?.heightTarget,
      comboForThreeStars: level?.comboForThreeStars ?? 3,
    };
  }

  if (mode === "daily") {
    const rng = new SeededRng(seedFromString(getDateKey()));
    const baseSpeed = clamp(gameBalance.baseSpeed + rng.range(-20, 40), 90, gameBalance.maxSpeed);
    const startWidth = clamp(gameBalance.startWidth + rng.range(-30, 20), 120, 200);
    const tolerance = clamp(gameBalance.perfectToleranceBase + rng.range(-1.5, 1), 4, 8);
    return {
      config: {
        baseSpeed,
        maxSpeed: gameBalance.maxSpeed,
        speedRamp: gameBalance.speedRamp,
        perfectTolerance: tolerance,
        toleranceRamp: gameBalance.toleranceRamp,
        blockHeight: gameBalance.blockHeight,
        minWidth: gameBalance.minWidth,
        startWidth,
        comboCap: gameBalance.comboCap,
        perfectBonus: gameBalance.perfectBonus,
        comboBonus: gameBalance.comboBonus,
      },
      heightTarget: undefined,
      comboForThreeStars: 0,
    };
  }

  return {
    config: {
      baseSpeed: gameBalance.baseSpeed,
      maxSpeed: gameBalance.maxSpeed,
      speedRamp: gameBalance.speedRamp,
      perfectTolerance: gameBalance.perfectToleranceBase,
      toleranceRamp: gameBalance.toleranceRamp,
      blockHeight: gameBalance.blockHeight,
      minWidth: gameBalance.minWidth,
      startWidth: gameBalance.startWidth,
      comboCap: gameBalance.comboCap,
      perfectBonus: gameBalance.perfectBonus,
      comboBonus: gameBalance.comboBonus,
    },
    heightTarget: undefined,
    comboForThreeStars: 0,
  };
};

const GameScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode ?? "endless") as GameMode;
  const levelId = typeof params.levelId === "string" ? params.levelId : undefined;

  const [progress, setProgress] = useState<StoredProgress | null>(null);
  const { config, heightTarget, comboForThreeStars } = useMemo(
    () => buildConfig(mode, levelId),
    [mode, levelId],
  );
  const skin = useMemo(
    () => skins.find((item) => item.id === progress?.selectedSkinId) ?? skins[0],
    [progress],
  );

  const [hud, setHud] = useState({ score: 0, height: 1, combo: 0, status: "idle" });
  const [cameraY, setCameraY] = useState(0);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const engineRef = useRef<EngineState>(createEngineState(config, mode, heightTarget));
  const rafRef = useRef<number>();
  const timeRef = useRef<number>(Date.now());
  const particles = useParticlePool(gameBalance.particleCount);
  const shake = useScreenShake();
  const overhangVel = useRef<Record<number, { vy: number; rotation: number; vr: number }>>({});

  useEffect(() => {
    loadProgress().then((stored) => {
      setProgress(stored);
    });
  }, []);

  useEffect(() => {
    engineRef.current = createEngineState(config, mode, heightTarget);
    engineRef.current.status = "playing";
    timeRef.current = Date.now();
  }, [config, mode, heightTarget]);

  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const delta = now - timeRef.current;
      timeRef.current = now;
      const engine = engineRef.current;

      stepEngine(engine, delta, config as EngineConfig);
      const targetCamera = Math.max(0, engine.active.y - 200);
      setCameraY((current) => lerp(current, targetCamera, gameBalance.cameraSmooth));

      for (const overhang of engine.overhangs) {
        if (!overhangVel.current[overhang.id]) {
          overhangVel.current[overhang.id] = {
            vy: gameBalance.overhangFallSpeed,
            rotation: 0,
            vr: (Math.random() - 0.5) * 2,
          };
        }
        const data = overhangVel.current[overhang.id];
        data.vy += gameBalance.gravity * (delta * 0.001);
        overhang.y -= data.vy * (delta * 0.001);
        data.rotation += data.vr * (delta * 0.001);
        overhang.rotation = data.rotation;
      }
      engine.overhangs = engine.overhangs.filter((piece) => piece.y > -200);
      for (const key of Object.keys(overhangVel.current)) {
        if (!engine.overhangs.find((piece) => piece.id === Number(key))) {
          delete overhangVel.current[Number(key)];
        }
      }

      updateParticles(particles, delta);
      const nextShake = shake.update(delta);
      setShakeOffset(nextShake);

      setHud({
        score: engine.score.score,
        height: engine.score.height,
        combo: engine.score.combo,
        status: engine.status,
      });

      rafRef.current = requestAnimationFrame(loop);
      return nextShake;
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [config, particles, shake]);

  const handleDrop = async () => {
    const engine = engineRef.current;
    const result = dropBlock(engine, config as EngineConfig);

    if (result.isGameOver) {
      shake.trigger(gameBalance.shakeStrength * 1.5);
      await finalizeRun(engine, result);
      return;
    }

    if (result.isPerfect) {
      shake.trigger(gameBalance.shakeStrength);
      emitParticles(
        particles,
        0,
        -engine.active.y + 40,
        skin.particles.color,
        24,
      );
      if (progress?.settings.haptics) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      shake.trigger(gameBalance.shakeStrength * 0.5);
    }

    if (result.didLevelComplete) {
      await finalizeRun(engine, result);
    }
  };

  const unlockSkins = (next: StoredProgress) => {
    for (const skinItem of skins) {
      if (next.unlockedSkins.includes(skinItem.id)) {
        continue;
      }
      if (skinItem.unlock.type === "free") {
        next.unlockedSkins.push(skinItem.id);
      }
      if (
        skinItem.unlock.type === "bestScore" &&
        next.bestScoreEndless >= (skinItem.unlock.value ?? 0)
      ) {
        next.unlockedSkins.push(skinItem.id);
      }
      if (
        skinItem.unlock.type === "perfects" &&
        next.totalPerfects >= (skinItem.unlock.value ?? 0)
      ) {
        next.unlockedSkins.push(skinItem.id);
      }
    }
    if (!next.unlockedSkins.includes("classic")) {
      next.unlockedSkins.push("classic");
    }
  };

  const finalizeRun = async (engine: EngineState, result: { didLevelComplete: boolean }) => {
    if (!progress) {
      return;
    }

    const next: StoredProgress = {
      ...progress,
      totalPerfects: progress.totalPerfects + engine.score.perfects,
    };

    if (mode === "endless") {
      next.bestScoreEndless = Math.max(progress.bestScoreEndless, engine.score.score);
    }

    if (mode === "daily") {
      const key = getDateKey();
      next.dailyBest = {
        ...progress.dailyBest,
        [key]: Math.max(progress.dailyBest[key] ?? 0, engine.score.score),
      };
    }

    if (mode === "levels" && levelId) {
      const target = heightTarget ?? 0;
      const stars = engine.score.height >= target ? 2 : 0;
      const bonusStar = engine.score.maxCombo >= comboForThreeStars ? 1 : 0;
      next.levelStars = {
        ...progress.levelStars,
        [levelId]: Math.max(progress.levelStars[levelId] ?? 0, stars + bonusStar),
      };
    }

    unlockSkins(next);
    await saveProgress(next);

    router.replace({
      pathname: "/result",
      params: {
        mode,
        levelId: levelId ?? "",
        score: engine.score.score.toString(),
        height: engine.score.height.toString(),
        perfects: engine.score.perfects.toString(),
        maxCombo: engine.score.maxCombo.toString(),
        levelComplete: result.didLevelComplete ? "1" : "0",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.canvasWrapper} onPress={handleDrop}>
        <GameCanvas
          state={engineRef.current}
          background={skin.colors.background}
          stackColor={skin.colors.stack}
          activeColor={skin.colors.active}
          glowColor={skin.colors.glow}
          particles={particles}
          cameraY={cameraY}
          shake={shakeOffset}
        />
      </Pressable>
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topRow}>
          <View>
            <Text style={styles.label}>Score</Text>
            <Text style={styles.value}>{hud.score}</Text>
          </View>
          <View style={styles.centerStat}>
            <Text style={styles.label}>Combo</Text>
            <Text style={styles.value}>{hud.combo}</Text>
          </View>
          <View>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>{hud.height}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.modeLabel}>{mode.toUpperCase()}</Text>
          {heightTarget ? (
            <Text style={styles.modeLabel}>Target {heightTarget}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
  },
  canvasWrapper: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  label: {
    color: "#94A3B8",
    fontSize: 12,
  },
  value: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
  },
  centerStat: {
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modeLabel: {
    color: "#CBD5F5",
  },
});

export default GameScreen;
