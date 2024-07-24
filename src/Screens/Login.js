import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  BackHandler,
  Image,
  Modal,
  StyleSheet,
  Keyboard,
} from "react-native";

import { useIsFocused, useRoute } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore"; // Import Firebase Firestore functions
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import messaging from "@react-native-firebase/messaging";
import { StatusBar } from "expo-status-bar";

const Login = ({ navigation }) => {
  const route = useRoute();
  const isFocused = useIsFocused();
  const [fcmToken, setFcmToken] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const languages = [
    { label: "Select Language", value: "" },
    { label: "English", value: "English" },
    { label: "हिंदी", value: "हिंदी" },
    { label: "বাংলা", value: "বাংলা" },
  ];

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log("FCM token:", token);
    } catch (error) {
      console.error("Error getting FCM token:", error);
      // Handle token retrieval error
    }
  };

  useEffect(() => {
    getFCMToken(); // Retrieve FCM token on component mount
  }, []);

  const togglePicker = () => {
    setIsPickerVisible(!isPickerVisible);
  };

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    togglePicker();
    Keyboard.dismiss();
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [isFocused]); // Listen for changes in focus status of this screen

  const handleBackPress = () => {
    if (isFocused) {
      // Check if the user is currently on the Login screen
      if (Platform.OS === "android") {
        BackHandler.exitApp(); // Exit the app only if on the Login screen (Android)
        return true;
      }
      // For iOS or other cases, you might handle specific behavior or prevent default behavior
      // You can customize this part further based on your requirements for iOS or other platforms
      return true; // Return true to prevent default back button behavior
    } else if (navigation.canGoBack()) {
      // If not on the Login screen, navigate back if possible
      navigation.goBack();
      return true;
    }
    return false;
  };

  const signin = async () => {
    if (!employeeId) {
      alert("Please enter your employee ID.");
      return;
    }

    if (selectedLanguage === "") {
      alert("Please select a language.");
      return;
    }

    const formattedEmployeeId = employeeId.toUpperCase();
    console.log(formattedEmployeeId);

    try {
      const token = await messaging().getToken();
      if (!token) {
        alert("FCM token not generated. Please try again later.");
        return;
      }

      const querySnapshot = await firestore()
        .collection("Users")
        .where("employeeId", "==", formattedEmployeeId)
        .get();

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();

        // Check if the user already has an expo push token

        if (userData.expoPushToken) {
          alert("User is already logged in.");
          return;
        }

        const userRef = firestore().collection("Users").doc(userData.userid);
        console.log("token: " + token);
        await userRef.update({
          expoPushToken: token,
          language: selectedLanguage,
        });

        await saveData(
          userData.name,
          userData.userid,
          selectedLanguage,
          userData.employeeId
        );

        navigation.navigate("WelcomeScreen", {
          name: userData.name,
          userLanguage: selectedLanguage,
        });
      } else {
        alert("User Not Found");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again later.");
    }
  };

  useEffect(() => {
    // Check if the FCM token is available before allowing login
    if (fcmToken) {
      console.log("FCM token available:", fcmToken);
      // Place any additional logic here if needed before allowing login
    } else {
      console.log("FCM token not available yet.");
      // Add a loader or some indication that the token is being fetched
      // or handle scenarios where the token is not available yet
    }
  }, [fcmToken]);

  const saveData = async (name, userId, language, employeeId) => {
    try {
      JSON.stringify(employeeId);
      await SecureStore.setItemAsync("EMPLOYEEID", JSON.stringify(employeeId));
      await SecureStore.setItemAsync("NAME", name);
      await SecureStore.setItemAsync("USERID", userId);
      await SecureStore.setItemAsync("LANGUAGE", language);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "white",
        alignItems: "center",
      }}
    >
      <StatusBar backgroundColor="#5BA646" barStyle="dark-content" />
      <Image
        source={require("../../assets/Assent.png")}
        style={{ width: 200, height: 50 }}
        resizeMode="contain"
        alignSelf="center"
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          alignSelf: "center",
          marginTop: 50,
        }}
      >
        Login
      </Text>
      <TextInput
        placeholder="Enter Employee ID"
        value={employeeId}
        onChangeText={(txt) => setEmployeeId(txt)}
        style={{
          width: "80%",
          height: 50,
          fontSize: 18,
          borderBottomWidth: 1,
          borderColor: "#D1D1D1",
          alignSelf: "center",
          marginTop: 40,
          paddingLeft: 15,
        }}
      />

      <TouchableOpacity
        onPress={togglePicker}
        style={{
          width: "80%",
          height: 50,
          fontSize: 20,
          borderBottomWidth: 1,
          borderColor: "#D1D1D1",
          alignSelf: "center",
          marginTop: 20,
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 15,
        }}
      >
        <Text>{selectedLanguage || "Select Language"}</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isPickerVisible}
        onRequestClose={togglePicker}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.value}
                style={styles.pickerItem}
                onPress={() => selectLanguage(language.value)}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "400",
                    color: "#000",
                  }}
                >
                  {language.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={{
          marginTop: 40,
          width: "80%",
          height: 50,
          backgroundColor: "#5BA646",
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }}
        onPress={signin}
      >
        <Text style={{ color: "#fff", fontSize: 18 }}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 5,
    paddingVertical: 10,
  },
  pickerItem: {
    padding: 15,
  },
});

export default Login;
