import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { Input } from '@rneui/themed';
import { useSession } from "@/context/ctx";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const { resetPassword } = useSession();

  const handleResetPassword = async() => {
    if (!email) {
      Alert.alert("Por favor ingrese su correo electrónico");
      return;
    }

    const success = await resetPassword(email);
    if (success) {
      Alert.alert(
        "Se ha enviado un enlace para restablecer la contraseña a su correo electrónico."
      );
    } else {
      Alert.alert(
        "Hubo un problema al enviar el enlace para restablecer la contraseña."
      );
    }
  };

  return (
    <View className="flex-1 h-full px-10 justify-center w-full">
      <View>
        <Text className="text-2xl font-bold mb-5">Restablecer contraseña</Text>
        <Text className="mb-5">
          Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
        </Text>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity>
        <Text onPress={handleResetPassword} className="text-blue">Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
