import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Heading from "./Heading";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { CategoryIcons } from "../constants/Category";
import { RootStackParamList } from "@/types/index";

export default function Category() {
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  const displayedCategories = showAll ? CategoryIcons : CategoryIcons.slice(0, 4);

  return (
    <View className="p-1">
      <Heading
        text={"Categorías"}
        isViewAll={true}
        onPress={() => setShowAll(!showAll)}
      />
      <FlatList
        data={displayedCategories}
        numColumns={4}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex justify-center items-center p-3 mr-1"
            onPress={() =>
              navigation.navigate("business-list", { category: item.name })
            }
          >
            <Image
              source={item.icon}
              style={{ width: 50, height: 50 }}
              className="rounded-full bg-gray-light"
              alt="iconos de www.flaticon.com"
            />
            {item.name.split(" ").map((word, index) => (
              <Text key={index} className="capitalize font-outfitMedium">
                {word}
              </Text>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
