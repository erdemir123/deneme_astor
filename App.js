import { Provider } from "react-redux";
import AppNavigator from "./navigator/AppNavigation";
import { store } from "./toolkit/store";
import { NavigationContainer } from "@react-navigation/native";






export default function App() {

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}