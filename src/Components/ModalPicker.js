import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ModalPicker = ({
  data,
  initValue,
  selectStyle,
  selectTextStyle,
  onChange,
  activelang,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (option) => {
    setModalVisible(false);
    onChange(option);
  };

  return (
    <View>
      <TouchableOpacity
        style={[selectStyle, { flexDirection: "row", alignItems: "center" }]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[selectTextStyle, { fontWeight: 600, paddingHorizontal: 10 }]}
        >
          {initValue}
        </Text>
        <Ionicons
          name="chevron-down-outline"
          size={20}
          color="rgba(225,225,225,0.95)"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        // animationType="slideLeft"
        transparent={true}
      >
        <LinearGradient
          colors={["#5BA646", "#18355F"]} // Linear gradient colors
          start={{ x: 0, y: 0 }} // Start point of the gradient
          end={{ x: 1, y: 1 }} // End point of the gradient
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/welcome.png")} // Path to the image in the assets folder
              resizeMode="contain"
              alignSelf="center"
              style={{ width: 200, height: 50, marginBottom: 30 }}
            />
            {/* <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 20,
              }}
            >
              Choose Language
            </Text> */}
            <View
              style={{
                textalign: "center",

                width: "40%",

                maxHeight: 300,
                overflow: "hidden",
              }}
            >
              <FlatList
                data={data}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 20,
                      height: 50,
                      borderBottomWidth: 1,
                      borderColor: "rgba(225,225,225,0.5)",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center", // Align text and icon horizontally
                    }}
                    onPress={() => handleSelect(item)}
                  >
                    <View
                      style={{
                        marginLeft: 0,
                        display: "flex",
                        justifyContent: "center", // Align text and icon vertically
                        alignContent: "center", // Align text and icon vertically
                      }}
                    >
                      {activelang === item.key && (
                        <Ionicons
                          style={{ position: "absolute", right: 10 }}
                          name="chevron-forward-outline" // Replace with the appropriate icon name
                          size={20}
                          color="rgba(225,225,225,0.95)"
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "400",
                        color: "#fff",
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </LinearGradient>
      </Modal>
    </View>
  );
};

export default ModalPicker;
