import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "@/types/index";
import Heading from "@/components/Heading";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/ctx";

export default function BusinessDetail() {
  const { session } = useSession();
  const route = useRoute<RouteProp<RootStackParamList, "business-detail">>();
  const navigation = useNavigation();
  const [isReadMore, setIsReadMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]); // Estado para almacenar la lista de negocios
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const { business } = route.params;

  const onMessage = () => {
    Linking.openURL(
      `mailto:${business.email}?subject=Consulta sobre ${business.name}&body=Hola ${business.phone}`
    );
  };

  async function downloadImage(path: string): Promise<void> {
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
        Alert.alert("Error al descargar la imagen", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (business.banner) {
      downloadImage(business.banner);
    }
  }, [business.banner]);


  return (
    <View>
      <ScrollView style={{ height: "92%" }} className="relative">
        <TouchableOpacity
          className="flex flex-row p-2 items-center gap-2 absolute z-10 mt-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: bannerUrl || undefined }}
          style={{ width: "100%", height: 200 }}
          className="rounded-3xl"
        />
        <View className="p-3">
          <Text className="font-outfitBold text-2xl">{business.name}</Text>
          <View className="flex flex-row gap-2 items-center">
            <Text className="font-outfitSemiBold text-primary">
              {business.phone} 🌟
            </Text>
            <Text className="capitalize font-outfitRegular text-white bg-primary p-1 rounded-full">
              {business.category}
            </Text>
          </View>
          <Text className="font-outfitRegular text-gray">{business.email}</Text>
          <View className="flex flex-row items-center">
            <MaterialIcons name="location-pin" size={20} color="#3b82f6" />
            <Text className="font-outfitRegular">{business.address}</Text>
          </View>
          {/*horizontal line */}
          <View className="border-b-2 border-gray-light my-2"></View>
          <View>
            <Heading text={`Acerca de ${business.phone}`} />
            <Text
              numberOfLines={isReadMore ? 20 : 5}
              className="font-outfitRegular pt-2 text-base leading-7"
            >
              {business.description}
            </Text>
            <TouchableOpacity
              onPress={() => setIsReadMore(!isReadMore)}
              className="flex flex-row items-center gap-1"
            >
              <Text className="font-outfitRegular text-primary">
                {isReadMore ? "Mostrar menos" : "Mostrar más"}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="border-b-2 border-gray-light my-2"></View>
        </View>
      </ScrollView>
      <View className="flex flex-row gap-1 px-1">
        <TouchableOpacity className="flex-1" onPress={onMessage}>
          <Text className="p-2 text-center text-lg font-outfitBold border-solid border-2 rounded-full border-primary text-primary">
            Contactar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1" onPress={() => setShowModal(true)}>
          <Text className="p-2 text-center text-lg font-outfitBold bg-primary text-white rounded-full">
            Agendar
          </Text>
        </TouchableOpacity>
      </View>
      <Modal visible={showModal} animationType="slide">
        <TouchableOpacity
          className="flex flex-row justify-end p-2"
          onPress={() => setShowModal(false)}
        >
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
