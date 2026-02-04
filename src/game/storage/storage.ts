import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredProgress = {
  bestScoreEndless: number;
  dailyBest: Record<string, number>;
  levelStars: Record<string, number>;
  unlockedSkins: string[];
  selectedSkinId: string;
  totalPerfects: number;
  settings: {
    sound: boolean;
    haptics: boolean;
  };
};

const defaultProgress: StoredProgress = {
  bestScoreEndless: 0,
  dailyBest: {},
  levelStars: {},
  unlockedSkins: ["classic"],
  selectedSkinId: "classic",
  totalPerfects: 0,
  settings: {
    sound: true,
    haptics: true,
  },
};

const STORAGE_KEY = "perfect-stack-progress";

export const loadProgress = async (): Promise<StoredProgress> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultProgress;
  }
  try {
    const parsed = JSON.parse(raw) as StoredProgress;
    return {
      ...defaultProgress,
      ...parsed,
      settings: {
        ...defaultProgress.settings,
        ...parsed.settings,
      },
      totalPerfects: parsed.totalPerfects ?? defaultProgress.totalPerfects,
    };
  } catch (error) {
    return defaultProgress;
  }
};

export const saveProgress = async (progress: StoredProgress) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};
