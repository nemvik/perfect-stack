# Perfect Stack: Timing

Mobilní stackovací hra v Expo (React Native + TypeScript) s renderem přes Skia.

## Rychlý start

```bash
npm install
npm run start
```

## Jak editovat JSON konfiguraci

Všechny parametry hry jsou v `src/config`:

- `gameBalance.json` – globální nastavení feelu (rychlosti, tolerance, kamera, shake, scoring).
- `levels.json` – definice levelů (target výška, rychlosti, tolerance, 3★ podmínka).
- `skins.json` – skin packy (barvy, particles, unlock pravidla).

Aplikace načítá JSON přes parser s fallback hodnotami v `src/config/index.ts`.

### Přidání levelu

1. Otevři `src/config/levels.json`.
2. Přidej nový objekt:

```json
{
  "id": "level-4",
  "name": "Pulse",
  "heightTarget": 30,
  "startWidth": 150,
  "baseSpeed": 160,
  "speedRamp": 0.02,
  "perfectTolerance": 5,
  "comboForThreeStars": 6
}
```

### Přidání skinu

1. Otevři `src/config/skins.json`.
2. Přidej nový objekt:

```json
{
  "id": "neon",
  "name": "Neon",
  "colors": {
    "stack": "#A855F7",
    "active": "#C084FC",
    "background": "#0B0B12",
    "glow": "#E9D5FF"
  },
  "particles": { "color": "#C084FC", "size": 3 },
  "unlock": { "type": "bestScore", "value": 60 }
}
```

### Klíčové konstanty pro feel

- `gameBalance.json`
  - `baseSpeed`, `maxSpeed`, `speedRamp` – tempo a rampování obtížnosti.
  - `perfectToleranceBase`, `toleranceRamp` – okno pro perfect hit.
  - `cameraSmooth` – jak rychle kamera dojíždí za věží.
  - `shakeStrength` – intenzita screen shake.
  - `comboCap`, `perfectBonus`, `comboBonus` – scoring.

## Testy

```bash
npm run test
```
