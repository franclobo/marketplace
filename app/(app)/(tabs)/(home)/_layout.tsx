import {
  createStackNavigator,
} from "@react-navigation/stack";
import BusinessListByCategory from "./businesslistbycategory";
import BusinessDetails from "./businessdetails";
import Index from "./index";



const Stack = createStackNavigator();

export default function HomeNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        component={Index}
      />
      <Stack.Screen
        name="business-list"
        component={BusinessListByCategory}
      />
      <Stack.Screen name="business-detail" component={BusinessDetails} />
    </Stack.Navigator>
  );
}
