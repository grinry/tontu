import { Platform } from "react-native";

const defaultApiUrl =
  Platform.OS === "android" ? "http://10.0.2.2:4111" : "http://localhost:4111";
export const apiUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl
).replace(/\/$/, "");
