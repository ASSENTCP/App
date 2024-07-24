import React, { useEffect } from "react";
import { View, Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useIsFocused } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";

const Logout = ({ navigation }) => {
  const isFocused = useIsFocused();
  const handleLogout = async () => {
    try {
      const userId = await SecureStore.getItemAsync("USERID");
      const userEmployeeId = await SecureStore.getItemAsync("EMPLOYEEID"); // Retrieve the user ID
      if (userId) {
        console.log("User Logged out " + userEmployeeId);
        await SecureStore.deleteItemAsync("EMPLOYEEID");
        await SecureStore.deleteItemAsync("NAME");
        await SecureStore.deleteItemAsync("USERID");
        await SecureStore.deleteItemAsync("TOKEN");
        await SecureStore.deleteItemAsync("LANGUAGE");
        await SecureStore.deleteItemAsync("userImageUrl");

        // Delete user token or other sensitive data
        await clearExpoToken(userId); // Clear the active token in Firebase
      }

      // You might want to also clear any user state in your app here
      // For example, if you're using a context for authentication, reset the context state.

      navigation.navigate("Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const clearExpoToken = async (userId) => {
    try {
      const userRef = firestore().collection("Users").doc(userId);
      await userRef.update({ expoPushToken: null });
      console.log("Expo token cleared");
    } catch (error) {
      console.error("Error clearing active token:", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      handleLogout();
    }
  }, [isFocused]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Logging out.... </Text>
    </View>
  );
};

export default Logout;
