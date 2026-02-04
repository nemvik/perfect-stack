import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { skins } from "@/config";
import { loadProgress, saveProgress, StoredProgress } from "@/game/storage/storage";

const SkinsScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState<StoredProgress | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const isUnlocked = (skinId: string) => progress?.unlockedSkins.includes(skinId);

  const onSelect = async (skinId: string) => {
    if (!progress || !isUnlocked(skinId)) {
      return;
    }
    const next = { ...progress, selectedSkinId: skinId };
    setProgress(next);
    await saveProgress(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skins</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={skins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const unlocked = isUnlocked(item.id);
          const isSelected = progress?.selectedSkinId === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, { borderColor: item.colors.glow }]}
              onPress={() => onSelect(item.id)}
            >
              <View style={styles.cardRow}>
                <View style={[styles.colorPreview, { backgroundColor: item.colors.stack }]} />
                <View style={[styles.colorPreview, { backgroundColor: item.colors.active }]} />
                <View style={[styles.colorPreview, { backgroundColor: item.colors.background }]} />
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>
                {unlocked ? (isSelected ? "Selected" : "Tap to select") : "Locked"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    color: "#F8FAFC",
    fontWeight: "700",
  },
  back: {
    color: "#94A3B8",
  },
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    gap: 8,
  },
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: "#E2E8F0",
    fontWeight: "600",
    marginTop: 10,
  },
  cardSubtitle: {
    color: "#94A3B8",
  },
});

export default SkinsScreen;
