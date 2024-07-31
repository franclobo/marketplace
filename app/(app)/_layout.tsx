import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Text,
} from "react-native";
import { Redirect, Stack } from "expo-router";

import { useSession } from "@/context/ctx";

export default function AppLayout() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 mt-10">
            <Text>Loading...</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}
