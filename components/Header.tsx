import { View, Text, Image, TextInput, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";
import { AntDesign } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

export default function Header() {
  const { session } = useSession();
  const [name, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("users")
        .select(`name, avatar`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.name);
        if (data.avatar) {
          downloadImage(data.avatar);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatar(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(
          "Error al descargar la imagen: ",
          `From header: ${error.message}\nStack: ${error.stack}`
        );
      }
    }
  }

  return (
    <View className="bg-primary rounded-br-2xl rounded-bl-2xl p-2">
      <View className="flex flex-row items-center gap-10 p-2">
        {avatar ? (
          <Image source={{ uri: avatar }} className="w-10 h-10 rounded-full" />
        ) : (
          <Entypo name="user" size={24} color="black" />
        )}
        <View>
          <Text className="font-outfitRegular text-white">Bienvenido, </Text>
          {loading ? (
            <Text className="text-white">Cargando...</Text>
          ) : (
            <Text className="text-bold text-xl text-white font-outfitExtraBold">
              {name}
            </Text>
          )}
        </View>
      </View>
      <View className="flex flex-row items-center gap-1 pb-2">
        <TextInput
          placeholder="Buscar"
          className="bg-white rounded-full p-2 w-11/12"
        />
        <AntDesign
          name="search1"
          size={24}
          color="white"
          className="absolute top-2 right-2"
        />
      </View>
    </View>
  );
}
