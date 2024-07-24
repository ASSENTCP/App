import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import * as SecureStore from "expo-secure-store";

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const employeeId = await SecureStore.getItemAsync("EMPLOYEEID");

      console.log("Employee ID:", employeeId);

      if (employeeId !== null) {
        const cleanedEmployeeId = employeeId.replace(/"/g, "");

        const usersRef = firestore().collection("Users");
        const querySnapshot = await usersRef
          .where("employeeId", "==", cleanedEmployeeId)
          .get();

        if (!querySnapshot.empty) {
          // Check if the user has an expoPushToken
          querySnapshot.forEach(async (doc) => {
            const { expoPushToken } = doc.data();

            if (expoPushToken) {
              // User has expoPushToken, navigate to Main
              navigation.navigate("Main");
            } else {
              // User doesn't have expoPushToken, navigate to Login
              navigation.navigate("Login");
            }
          });
        } else {
          // User not found in the database, navigate to Login
          navigation.navigate("Login");
        }
      } else {
        // No stored employee ID, navigate to Login
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Error checking login:", error);
      // An error occurred, navigate to Login
      navigation.navigate("Login");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/asu.png")}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // Background color (customize as needed)
  },
  image: {
    width: "70%",
    height: "100%",
  },
});

export default Splash;
