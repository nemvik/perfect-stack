import { useMemo } from "react";
import { Circle, Group } from "@shopify/react-native-skia";

export type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};

export const useParticlePool = (count: number) => {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        size: 3,
        color: "#fff",
      })),
    [count],
  );
};

export const ParticleLayer = ({ particles }: { particles: Particle[] }) => (
  <Group>
    {particles
      .filter((particle) => particle.life > 0)
      .map((particle) => (
        <Circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          color={particle.color}
          opacity={particle.life}
        />
      ))}
  </Group>
);
