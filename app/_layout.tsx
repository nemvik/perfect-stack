import { Stack } from "expo-router";
import React from "react";

const Layout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="levels" />
    <Stack.Screen name="skins" />
    <Stack.Screen name="game" />
    <Stack.Screen name="result" />
  </Stack>
);

export default Layout;
