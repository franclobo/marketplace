import { Slot } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SessionProvider } from "@/context/ctx";

export default function Root() {
  // Set up the auth context and render our layout inside of it.
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
        <SessionProvider>
          <Slot />
        </SessionProvider>
    </KeyboardAvoidingView>
  );
}
