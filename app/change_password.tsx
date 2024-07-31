import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Input } from '@rneui/themed';
import { useSession } from '@/context/ctx';
import { validatePassword } from "@/hooks/useValidation";

export default function ChangePassword() {
  const [password, setPassword] = React.useState('');
  const { changePassword } = useSession();

  const handleChangePassword = async () => {
    if (!password) {
      Alert.alert('Por favor ingrese su nueva contraseña');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos."
      );
      return;
    }

    const success = await changePassword(password);
    if (success) {
      Alert.alert('Se ha cambiado su contraseña correctamente.');
    } else {
      Alert.alert('Hubo un problema al cambiar su contraseña.');
    }
  };

  return (
    <View className="flex-1 h-full px-10 justify-center w-full">
      <View>
        <Text className="text-2xl font-bold mb-5">Cambiar contraseña</Text>
        <Text className="mb-5">
          Ingrese una contraseña segura para proteger su cuenta, debe contener
          al menos 8 caracteres entre mayúsculas, minúsculas, números y
          símbolos.
        </Text>
        <Input
          label="Nueva contraseña"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity>
        <Text onPress={handleChangePassword} className="text-blue">
          Cambiar contraseña
        </Text>
      </TouchableOpacity>
    </View>
  );
}
