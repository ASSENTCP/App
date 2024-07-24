import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const CustomModalHeader = ({ onBackPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={35} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 10,
    paddingLeft: 15,
    height: Platform.OS === "ios" ? "15%" : "auto",
  },
  backButton: {
    marginRight: 10,
  },
});

export default CustomModalHeader;
