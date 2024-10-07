// screens/Auth.tsx
import React, { useState } from "react";
import { View, Image, TouchableOpacity, Text, Alert } from "react-native";
import { Input, CheckBox } from "@rneui/themed";
import { useSession } from "@/context/ctx";
import { validateEmail, validatePassword } from "@/hooks/useValidation";
import { Redirect } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

const MAX_ATTEMPTS = 6;

export default function Auth() {
  const { signIn, signUp, loading } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    return <Redirect href="/reset-password" />;
  }

  const handleSignIn = async () => {
    if (attempts >= MAX_ATTEMPTS) {
      Alert.alert(
        "Excediste el número de intentos: Solicita una nueva contraseña"
      );
      return;
    }

    const success = await signIn(email, password, rememberMe);
    if (!success) {
      setAttempts((prev) => prev + 1);
    }
  };

  const handleSignUp = async () => {

    if (!validateEmail(email)) {
      Alert.alert("Formato de email inválido");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos."
      );
      return;
    }

    const success = await signUp(email, password);
    if (!success) {
      setAttempts((prev) => prev + 1);
    }
  };

  const getAttemptMessage = () => {
    const attemptsLeft = MAX_ATTEMPTS - attempts;
    if (attemptsLeft > 1) {
      return `Email o contraseña incorrectos: te quedan ${attemptsLeft} intentos`;
    } else if (attemptsLeft === 1) {
      return `Email o contraseña incorrectos: te queda 1 intento`;
    } else {
      return `Excediste el número de intentos: Solicita una nueva contraseña`;
    }
  };

  return (
    <View className="flex items-center justify-center p-10">
      <View className="w-full items-center">
        <Image
          source={require("../assets/images/logo.png")}
          className="w-20 h-20"
        />
      </View>
      <View className="py-2 w-full mt-20">
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
      </View>
      <View className="py-2 w-full relative">
        <Input
          secureTextEntry={!showPassword}
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          placeholder="Password"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleShowPassword} className="absolute bottom-14 right-4">
          {showPassword ? (
            <Feather name="eye" size={24} color="black" />
          ) : (
            <Feather name="eye-off" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
      <CheckBox
        title="Recuérdame"
        checked={rememberMe}
        onPress={() => setRememberMe(!rememberMe)}
      />
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text className="text-blue">Olvidé mi contraseña</Text>
      </TouchableOpacity>
      {attempts > 0 && (
        <Text
          className={`mt-2 ${attempts >= 3 ? "text-red-500" : "text-black"}`}
        >
          {getAttemptMessage()}
        </Text>
      )}
      <TouchableOpacity
        className={`w-full mt-4 ${
          attempts >= MAX_ATTEMPTS ? "bg-gray" : "bg-primary"
        }`}
        disabled={loading || attempts >= MAX_ATTEMPTS}
        onPress={handleSignIn}
      >
        <Text className="text-white text-lg font-bold text-center py-2 rounded-full">
          Iniciar Sesión
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`w-full mt-4 ${
          attempts >= MAX_ATTEMPTS ? "bg-gray" : "bg-primary"
        }`}
        disabled={loading || attempts >= MAX_ATTEMPTS}
        onPress={handleSignUp}
      >
        <Text className="text-white text-lg font-bold text-center py-2 rounded-full">
          Registrarse
        </Text>
      </TouchableOpacity>
    </View>
  );
}
