import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { loadProgress, StoredProgress } from "@/game/storage/storage";
import { skins } from "@/config";

const HomeScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState<StoredProgress | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  const selectedSkin = skins.find((skin) => skin.id === progress?.selectedSkinId) ?? skins[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfect Stack: Timing</Text>
        <Text style={styles.subtitle}>Best: {progress?.bestScoreEndless ?? 0}</Text>
      </View>

      <View style={styles.ctaGroup}>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: selectedSkin.colors.active }]}
          onPress={() => router.push({ pathname: "/game", params: { mode: "endless" } })}
        >
          <Text style={styles.ctaText}>Endless</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cta} onPress={() => router.push("/levels")}>
          <Text style={styles.ctaText}>Levels</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push({ pathname: "/game", params: { mode: "daily" } })}
        >
          <Text style={styles.ctaText}>Daily Challenge</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/skins")}>
          <Text style={styles.secondaryText}>Skins</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    color: "#F8FAFC",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 18,
    color: "#94A3B8",
  },
  ctaGroup: {
    gap: 16,
  },
  cta: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryText: {
    color: "#CBD5F5",
  },
});

export default HomeScreen;
