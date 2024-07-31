import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Tabs
          screenOptions={{ tabBarActiveTintColor: "blue", headerShown: false }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Inicio",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="home" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="admin"
            options={{
              title: "Mi tienda",
              tabBarIcon: ({ color }) => (
                <FontAwesome5 size={28} name="store" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Perfil",
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name="user" color={color} />
              ),
            }}
          />
        </Tabs>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
