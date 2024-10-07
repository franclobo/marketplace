import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Heading from "./Heading";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";
import { StorageCategory } from "@/types/index";

export default function BusinessList() {
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]); // Estado para almacenar la lista de negocios
  const [banners, setBanners] = useState<{ [key: string]: string | null }>({});

  const categories = Object.keys(StorageCategory).map((key) => ({
    id: key,
    name: StorageCategory[key as keyof typeof StorageCategory],
  }));

  useEffect(() => {
    getStores();
  }, []);

  async function getStores() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("stores")
        .select(
          "id, name, description, address, phone, products, owner, category, banner"
        );

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Business Data:", data);
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

  const displayedBusiness = showAll ? stores : stores.slice(0, 4);

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

  return (
    <View className="p-1 bg-gray-light">
      <Heading text={"Negocios"} />
      <FlatList
        data={displayedBusiness}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex justify-center items-start p-2 gap-y-0.5 mr-1 bg-white rounded-lg"
             onPress={() =>
              // @ts-ignore
               navigation.push("business-detail", { business: item })
             }
          >
            <Image
              source={{ uri: banners[item.id] || undefined }}
              style={{ width: 150, height: 80 }}
              className="rounded-3xl bg-gray-light"
            />
            <Text className="capitalize font-outfitBlack text-lg">
              {item.name}
            </Text>
            <Text className="capitalize">{item.phone}</Text>
            <Text className="capitalize text-sm bg-purple text-white rounded-lg px-1">
              {item.category}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
