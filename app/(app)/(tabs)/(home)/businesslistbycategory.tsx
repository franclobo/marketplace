import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList, Store } from "@/types/index";

export default function BusinessListByCategory() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "business-list">>();
  const { category } = route.params;
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [banners, setBanners] = useState<{ [key: string]: string | null }>({});

  async function getStores() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("stores")
        .select(
          "id, name, description, address, phone, products, owner, category, banner"
        )
        .eq("category", category);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Data:", data); // Verifica qué datos estás obteniendo
        const bannersData: { [key: string]: string | null } = {};
        const bannerPromises = data.map(async (store: any) => {
          if (store.banner) {
            const banner = await downloadImage(store.banner);
            bannersData[store.id] = banner;
          }
        });

        await Promise.all(bannerPromises);

        setBanners(bannersData);
        setStores(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
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

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      return new Promise((resolve) => {
        fr.onload = () => resolve(fr.result as string);
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error al descargar la imagen", error.message);
      }
      return null;
    }
  }

  useEffect(() => {
    getStores();
  }, []);

  return (
    <View className="p-1 bg-gray-light mt-5 h-full">
      <TouchableOpacity
        className="flex flex-row p-2 items-center gap-2"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text className="font-outfitExtraBold text-xl capitalize">
          {category}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View>
          {stores.length > 0 ? (
            stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                className="flex justify-center items-start p-2 gap-y-0.5 mr-1 bg-white rounded-lg"
                onPress={() =>
                  //@ts-ignore
                  navigation.navigate("business-detail", { business: store })
                }
              >
                <Text className="font-outfitBold text-lg">{store.name}</Text>
                <Text className="font-outfitRegular text-sm">
                  {store.address}
                </Text>
                <Text className="font-outfitRegular text-sm">
                  {store.phone}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="font-outfitRegular text-sm">
              No hay tiendas disponibles.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
