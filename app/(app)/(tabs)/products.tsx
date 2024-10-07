import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";
import * as ImagePicker from "expo-image-picker";

export default function UpdateProducts() {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0.0);
  const [pictureUrls, setPictureUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  const { width } = Dimensions.get("window");
  const imageWidth = width / 5;

  useEffect(() => {
    if (session) getStore();
  }, [session]);

  async function getStore() {
    setLoading(true);
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("products")
        .select(`name, description, pictures, quantity, price`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.name);
        setDescription(data.description);
        setPictures(data.pictures);
        setQuantity(data.quantity);
        setPrice(data.price);

        // Descargar las imágenes si hay URLs disponibles
        const urls = await Promise.all(
          data.pictures.map((picture: string) => downloadImage(picture))
        );
        setPictureUrls(await Promise.all(urls));
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(path: string): Promise<string | null> {
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
          `From products: ${error.message}\nStack: ${error.stack}`
        );
        console.log("Error", error);
      }
      return null;
    }
  }

  const uploadProduct = async (index: number) => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        Alert.alert("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      Alert.alert(`Imagen seleccionada: ${image.uri}`);

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      const arraybuffer = await fetch(image.uri).then((res) =>
        res.arrayBuffer()
      );

      const fileExt = image.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("pictures")
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      const newPictures = [...pictures];
      newPictures[index] = data.path;
      setPictures(newPictures);

      const newPictureUrls = [...pictureUrls];
      newPictureUrls[index] = await downloadImage(data.path);
      setPictureUrls(newPictureUrls);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProducts = async ({
    name,
    description,
    pictures,
    quantity,
    price,
  }: {
    name: string;
    description: string;
    pictures: string[];
    quantity: number;
    price: number;
  }) => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        name,
        description,
        pictures,
        quantity,
        price,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("products").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
      Alert.alert("Productos actualizados satisfactoriamente!");
    }
  };

  const displayPictureUrls = [...pictureUrls];
  while (displayPictureUrls.length < 5) {
    displayPictureUrls.push(null);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 mt-10">
          <Text className="font-bold text-center py-2">
            Administra los productos de tu tienda
          </Text>
          <View className="flex flex-row flex-wrap gap-2 p-2">
            {displayPictureUrls.map((url, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => uploadProduct(index)}
                className="bg-primary rounded-lg p-2"
                style={{ marginBottom: 10 }}
              >
                {url ? (
                  <Image
                    source={{ uri: url }}
                    accessibilityLabel="Product"
                    style={{ width: imageWidth, height: imageWidth }}
                  />
                ) : (
                  <Image
                    source={require("@/assets/images/placeholder_image.png")}
                    style={{ width: imageWidth, height: imageWidth }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex gap-2 p-2">
            <TextInput
              placeholder="Nombre"
              value={name || ""}
              onChangeText={(text) => setName(text)}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TextInput
              placeholder="Descripción"
              multiline={true}
              numberOfLines={4}
              value={description || ""}
              onChangeText={(text) => setDescription(text)}
              className="border border-solid border-gray rounded-lg p-2"
              style={{ textAlignVertical: "top" }}
            />
            <TextInput
              placeholder="0"
              value={quantity.toString()}
              onChangeText={(text) => setQuantity(parseInt(text))}
              className="border border-solid border-gray rounded-lg p-2"
              keyboardType="numeric"
            />
            <TextInput
              placeholder="0.00"
              value={price.toString()}
              onChangeText={(text) => setPrice(parseFloat(text))}
              className="border border-solid border-gray rounded-lg p-2"
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() =>
                updateProducts({
                  name,
                  description,
                  pictures,
                  quantity,
                  price,
                })
              }
              className="bg-primary text-white rounded-lg p-2"
            >
              <Text className="text-white text-center">
                {loading ? "Cargando ..." : "Actualizar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
