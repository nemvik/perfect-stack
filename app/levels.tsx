import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { levels } from "@/config";
import { loadProgress, StoredProgress } from "@/game/storage/storage";

const LevelsScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState<StoredProgress | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Levels</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={levels}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const stars = progress?.levelStars[item.id] ?? 0;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({ pathname: "/game", params: { mode: "levels", levelId: item.id } })
              }
            >
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>Target {item.heightTarget}</Text>
              <Text style={styles.cardStars}>{"★".repeat(stars).padEnd(3, "☆")}</Text>
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
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    marginHorizontal: 6,
    borderRadius: 16,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    color: "#E2E8F0",
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#94A3B8",
  },
  cardStars: {
    color: "#FCD34D",
    marginTop: 4,
  },
});

export default LevelsScreen;
