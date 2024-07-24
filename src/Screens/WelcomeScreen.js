import React, { useEffect } from "react";
import { View, Text, Animated, Easing, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WelcomeScreen = ({ route, navigation }) => {
  const { name, userLanguage } = route.params;
  const fadeAnim = new Animated.Value(0);
  const firstName = name.split(" ")[0];

  useEffect(() => {
    const fadeIn = () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Adjust the duration as needed
        easing: Easing.linear, // You can choose a different easing function
        useNativeDriver: true, // Add this line for better performance
      }).start();
    };

    fadeIn();

    const timer = setTimeout(() => {
      navigation.replace("Main"); // Redirect to the Main screen after 5 seconds
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [fadeAnim, navigation]);

  return (
    <LinearGradient
      colors={["#5BA646", "#18355F"]} // Linear gradient colors
      start={{ x: 0, y: 0 }} // Start point of the gradient
      end={{ x: 1, y: 1 }} // End point of the gradient
      style={{ flex: 1 }}
    >
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          opacity: fadeAnim, // Use the animated opacity
          // Add a background color
        }}
      >
        <Text style={styles.greetingText}>
          {userLanguage === "हिंदी" ? (
            <>
              <Text style={styles.bigBoldText}>नमस्ते</Text>
              {"\n"}
              <Text style={styles.bigBoldText}>{firstName}!</Text>
              {"\n\n\n"}
              एसेंट कनेक्ट प्लस
              {"\n"}
              में आपका स्वागत है।
            </>
          ) : userLanguage === "বাংলা" ? (
            <>
              <Text style={styles.bigBoldText}>হ্যালো</Text>
              {"\n"}
              <Text style={styles.bigBoldText}>{firstName}!</Text>
              {"\n\n\n"}
              স্বাগতম
              {"\n"}
              এসেন্ট কানেক্ট প্লাসে
            </>
          ) : (
            <>
              <Text style={styles.bigBoldText}>Hello</Text>
              {"\n"}
              <Text style={styles.bigBoldText}>{firstName}!</Text>
              {"\n\n\n"}
              Welcome to
              {"\n"}
              ASSENT Connect Plus
            </>
          )}
        </Text>

        <Image
          source={require("../../assets/welcome.png")} // Path to the image in the assets folder
          resizeMode="contain"
          alignSelf="center"
          style={{ width: 150, height: 30, marginTop: 40 }}
        />
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingText: {
    fontSize: 24, // Increase the text size
    fontWeight: "500", // Apply a bold font weight
    textAlign: "center",
    color: "#fff", // Change the text color
  },
  bigBoldText: {
    fontSize: 48, // Adjust the font size as needed
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
