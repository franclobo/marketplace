import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, TextInput, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useSession } from "@/context/ctx";
import { StorageCategory } from '@/types';
import * as ImagePicker from "expo-image-picker";


export default function Admin() {
  const { session } = useSession();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [owner, setOwner] = useState("");
  const [category, setCategory] = useState("");
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);


  const categories = Object.keys(StorageCategory).filter((key) => isNaN(Number(key)));

  useEffect(() => {
    if (bannerUrl) downloadImage(bannerUrl);
  }, [bannerUrl]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("pictures")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setBannerUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error al descargar la imagen: ", error.message);
      }
    }
  }

  const uploadBanner = async () => {
    try {
      setLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
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
        throw new Error("No image uri!"); // Realistically, this should never happen, but just in case...
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

      setBannerUrl(data.path);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) getStore();
  }, [session]);

  async function getStore() {
    setLoading(true);
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("stores")
        .select(`name, description, address, phone, products, owner, category, banner`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.name);
        setDescription(data.description);
        setAddress(data.address);
        setPhone(data.phone);
        setProducts(data.products);
        setOwner(data.owner);
        setCategory(data.category);
        setBannerUrl(data.banner);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const updateStore = async ({
    name,
    description,
    address,
    phone,
    products,
    owner,
    category,
    banner
  }:{
    name: string;
    description: string;
    address: string;
    phone: string;
    products: string[];
    owner: string;
    category: string;
    banner: string;
  }) => {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        name,
        description,
        address,
        phone,
        products,
        owner,
        category,
        banner,
        // timestamp with time zone
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("stores").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
      Alert.alert("Store updated successfully!");
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 mt-10">
          <Text className="font-bold text-center py-2">
            Administra los datos de tu tienda
          </Text>
          <TouchableOpacity
            onPress={() => uploadBanner()}
            className="bg-primary rounded-lg p-2"
          >
            {
              bannerUrl ? (
                <Image
                  source={{ uri: bannerUrl }}
                  accessibilityLabel="Banner"
                  style={{ width: '100%', height: 200 }}
                />
              ) : (
                <Image source={require("@/assets/images/placeholder_image.png")} style={{ width: '100%', height: 200 }} />
              )
            }
          </TouchableOpacity>
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
              style={{textAlignVertical: "top"}}
            />
            <TextInput
              placeholder="Dirección"
              value={address || ""}
              onChangeText={(text) => setAddress(text)}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TextInput
              placeholder="Teléfono"
              value={phone || ""}
              onChangeText={(text) => setPhone(text)}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TextInput
              placeholder="Categoría"
              value={category || ""}
              onChangeText={(text) => setCategory(text)}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="bg-primary rounded-lg p-2"
            >
              <Text className="text-white text-center">Seleccionar categoría</Text>
            </TouchableOpacity>

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center">
                <View className="bg-white p-4 border border-gray-300 rounded-lg">
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => {
                        setCategory(category);
                        setModalVisible(false);
                      }}
                      className="bg-blue-500 text-white rounded-lg p-2 my-2"
                    >
                      <Text>{category}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-red-500 rounded-lg p-2"
                  >
                    <Text className="text-white text-center">Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <TextInput
              placeholder="Productos"
              value={products.join(", ") || ""}
              onChangeText={(text) => setProducts(text.split(", "))}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TextInput
              placeholder="Propietario"
              value={owner || ""}
              onChangeText={(text) => setOwner(text)}
              className="border border-solid border-gray rounded-lg p-2"
            />
            <TouchableOpacity
              onPress={() =>
                updateStore({
                  name,
                  description,
                  address,
                  phone,
                  products,
                  owner,
                  category,
                  banner: bannerUrl || "",
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

