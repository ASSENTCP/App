import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Splash from "./Screens/Splash";
import Login from "./Screens/Login";
// import Signup from "./Screens/Signup";
import Main from "./Screens/Main";
import AddNewBlog from "./Screens/AddNewBlog";
import PostDetails from "./Screens/PostDetails";
import Logout from "./Screens/Logout";
import WelcomeScreen from "./Screens/WelcomeScreen";
import Profile from "./Screens/Profile";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        {/* <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        /> */}
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />

        <Stack.Screen
          name="AddNewBlog"
          component={AddNewBlog}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="PostDetails"
          component={PostDetails}
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name="Logout"
          component={Logout}
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
