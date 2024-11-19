import { View, Text, Image, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import React from 'react'
import Compras from '@/assets/images/compras.png'
import CustomButton from '@/components/CustomButton';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase";

export default function Empecemos() {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "552646595263-e5054ki10crnglmn4ed5vdda77e2rf0a.apps.googleusercontent.com",
  });
  return (
    <View className="flex justify-center items-center">
      <Image source={Compras} alt="compras" />
      <View className="flex items-center justify-center w-full mt-1 p-1 gap-2">
        <Text className="font-bold">¡Empecemos!</Text>
        <Text>Registrate o inicia sesión para ingrezar a tu tienda</Text>
        <CustomButton
          title="Registrarse"
          onPress={() => router.push("/sign-up")}
        />
        <View className="flex flex-row items-center justify-center w-screen p-1 m-1">
          <View className="border border-solid border-gray-300 max-h-0.5 w-full" />
          <Text className="mx-2">o</Text>
          <View className="border border-solid border-gray-300 max-h-0.5 w-full" />
        </View>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              if (userInfo?.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: userInfo.data.idToken,
                });
                console.log(error, data);
              } else {
                throw new Error("no ID token present!");
              }
            } catch (error: any) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
              } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
              } else if (
                error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
              ) {
                // play services not available or outdated
              } else {
                // some other error happened
              }
            }
          }}
        />
        <Text>
          ¿Ya tienes una cuenta?
          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text className="text-blue">Inicia sesión</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}
