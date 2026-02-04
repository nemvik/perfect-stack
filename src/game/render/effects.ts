import { useCallback, useRef } from "react";
import { clamp } from "../engine/math";
import { Particle } from "./particles";

type ScreenShake = {
  x: number;
  y: number;
  strength: number;
};

export const useScreenShake = () => {
  const shakeRef = useRef<ScreenShake>({ x: 0, y: 0, strength: 0 });

  const trigger = useCallback((strength: number) => {
    shakeRef.current = { x: 0, y: 0, strength };
  }, []);

  const update = useCallback((delta: number) => {
    const shake = shakeRef.current;
    if (shake.strength <= 0) {
      return { x: 0, y: 0 };
    }
    const decay = clamp(shake.strength - delta * 0.02, 0, 20);
    shakeRef.current.strength = decay;
    shakeRef.current.x = (Math.random() - 0.5) * decay;
    shakeRef.current.y = (Math.random() - 0.5) * decay;
    return { x: shakeRef.current.x, y: shakeRef.current.y };
  }, []);

  return { trigger, update };
};

export const emitParticles = (
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
) => {
  let spawned = 0;
  for (const particle of particles) {
    if (particle.life <= 0 && spawned < count) {
      particle.x = x + (Math.random() - 0.5) * 8;
      particle.y = y + (Math.random() - 0.5) * 8;
      particle.vx = (Math.random() - 0.5) * 120;
      particle.vy = (Math.random() - 0.5) * 120 - 30;
      particle.life = 1;
      particle.size = 2 + Math.random() * 2.5;
      particle.color = color;
      spawned += 1;
    }
  }
};

export const updateParticles = (particles: Particle[], delta: number) => {
  const dt = delta * 0.001;
  for (const particle of particles) {
    if (particle.life > 0) {
      particle.life = clamp(particle.life - dt * 2.2, 0, 1);
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 240 * dt;
    }
  }
};
