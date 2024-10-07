import { View, Text, Image, FlatList, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import Heading from "./Heading";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";

export default function Slider() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [pictures, setPictures] = useState<string[]>([]);
  const [pictureUrls, setPictureUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    if (session) getStore();
  }, [session]);

  async function getStore() {
    setLoading(true);
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("products")
        .select(`pictures`);

      if (error && status !== 406) {
        throw error;
      }

      if (data && data.length > 0) {
        const picturesArray = data[0].pictures;
        setPictures(picturesArray);

        // Descargar las imágenes si hay URLs disponibles
        const urls = await Promise.all(
          picturesArray.map((picture: string) => downloadImage(picture))
        );
        setPictureUrls(urls);
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
        .from("pictures")
        .download(path);
      if (error) throw error;

      const fr = new FileReader();
      return new Promise<string>((resolve, reject) => {
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(new Error("Error al leer la imagen"));
        fr.readAsDataURL(data);
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(
          "Error al descargar la imagen: ",
          `From slider: ${error.message}\nStack: ${error.stack}`
        );
      }
      return null;
    }
  }

  return (
    <View className="p-1">
      <Heading text={"Nuestras Ofertas"} />
      <FlatList
        data={pictureUrls}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="p-3 mr-3">
            {item ? (
              <Image
                source={{ uri: item }}
                style={{ width: 200, height: 100 }}
                className="rounded-3xl"
              />
            ) : (
              <Text>Cargando...</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}
