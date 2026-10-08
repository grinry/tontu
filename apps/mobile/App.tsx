import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { checkBackend } from "./src/api/health";

export default function App() {
  const [status, setStatus] = useState("Ready to connect to the backend.");
  const [checking, setChecking] = useState(false);

  async function checkConnection() {
    setChecking(true);
    try {
      const health = await checkBackend();
      setStatus(`Connected. Database: ${health.database}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tontu</Text>
      <Text style={styles.status} accessibilityLiveRegion="polite">
        {status}
      </Text>
      <Button
        title={checking ? "Connecting…" : "Check backend"}
        disabled={checking}
        onPress={checkConnection}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  title: { fontSize: 32, fontWeight: "700" },
  status: { textAlign: "center", fontSize: 16 },
});
