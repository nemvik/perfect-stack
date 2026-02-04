import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const score = Number(params.score ?? 0);
  const height = Number(params.height ?? 0);
  const perfects = Number(params.perfects ?? 0);
  const maxCombo = Number(params.maxCombo ?? 0);
  const mode = String(params.mode ?? "endless");
  const levelId = String(params.levelId ?? "");
  const levelComplete = params.levelComplete === "1";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{levelComplete ? "Level Complete" : "Run Complete"}</Text>
        <Text style={styles.metric}>Score: {score}</Text>
        <Text style={styles.metric}>Height: {height}</Text>
        <Text style={styles.metric}>Perfects: {perfects}</Text>
        <Text style={styles.metric}>Max Combo: {maxCombo}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primary}
          onPress={() =>
            router.replace({ pathname: "/game", params: { mode, levelId: levelId || undefined } })
          }
        >
          <Text style={styles.primaryText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => router.replace("/")}
        >
          <Text style={styles.secondaryText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: "#111827",
    padding: 24,
    borderRadius: 20,
    gap: 10,
  },
  title: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "700",
  },
  metric: {
    color: "#CBD5F5",
    fontSize: 16,
  },
  actions: {
    gap: 12,
  },
  primary: {
    backgroundColor: "#38BDF8",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#0B0B12",
    fontSize: 16,
    fontWeight: "700",
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryText: {
    color: "#CBD5F5",
  },
});

export default ResultScreen;
