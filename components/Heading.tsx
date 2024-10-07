import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

export default function Heading({ text, isViewAll = false, onPress }: { text: string; isViewAll?: boolean; onPress?: () => void }) {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text className="font-outfitBlack text-xl">{text}</Text>
      {isViewAll && (
        <TouchableOpacity onPress={onPress}>
          <Text className="text-blue-500">Ver todo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
