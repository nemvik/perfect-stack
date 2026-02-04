import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { EngineState } from "../engine/types";
import { Particle, ParticleLayer } from "./particles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type GameCanvasProps = {
  state: EngineState;
  background: string;
  stackColor: string;
  activeColor: string;
  glowColor: string;
  particles: Particle[];
  cameraY: number;
  shake: { x: number; y: number };
};

export const GameCanvas = ({
  state,
  background,
  stackColor,
  activeColor,
  glowColor,
  particles,
  cameraY,
  shake,
}: GameCanvasProps) => {
  const originX = screenWidth * 0.5;
  const originY = screenHeight * 0.7;

  return (
    <Canvas style={[styles.canvas, { backgroundColor: background }]}
    >
      <Group transform={[{ translateX: originX + shake.x }, { translateY: originY + shake.y - cameraY }]}
      >
        {state.blocks.map((block) => (
          <Rect
            key={block.id}
            x={block.x - block.width * 0.5}
            y={-block.y - block.height}
            width={block.width}
            height={block.height}
            color={stackColor}
            opacity={0.95}
          />
        ))}
        <Rect
          x={state.active.x - state.active.width * 0.5}
          y={-state.active.y - state.active.height}
          width={state.active.width}
          height={state.active.height}
          color={activeColor}
        />
        {state.overhangs.map((overhang) => (
          <Group
            key={overhang.id}
            transform={[
              { translateX: overhang.x },
              { translateY: -overhang.y - overhang.height * 0.5 },
              { rotate: overhang.rotation },
              { translateX: -overhang.x },
              { translateY: overhang.y + overhang.height * 0.5 },
            ]}
          >
            <Rect
              x={overhang.x - overhang.width * 0.5}
              y={-overhang.y - overhang.height}
              width={overhang.width}
              height={overhang.height}
              color={glowColor}
              opacity={0.7}
            />
          </Group>
        ))}
        <ParticleLayer particles={particles} />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
