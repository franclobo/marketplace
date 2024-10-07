import Header from "@/components/Header";
import Slider from "@/components/Slider";
import Categories from "@/components/Categories";
import { View, Text } from "react-native";
import BusinessList from "@/components/BusinessList";

export default function Index() {
  return (
    <View className="flex-1 mt-10">
      <Header />
      <Slider />
      <Categories />
      <BusinessList />
    </View>
  );
}
