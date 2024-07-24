import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal, // Import the Modal component from react-native
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";

import * as SecureStore from "expo-secure-store";

import * as Animatable from "react-native-animatable";

import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import {
  ref,
  deleteObject,
  getDownloadURL,
  uploadString,
} from "@react-native-firebase/storage";

import { Alert } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const SkeletonLoading = () => {
  return (
    <View
      style={{
        paddingHorizontal: 20,

        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <ShimmerPlaceholder
        shimmerStyle={{
          width: 300,
          height: 300,
          borderRadius: 150,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 20,
          marginTop: 40,
        }} // Cover full width
        autoRun={true}
        visible={false}
      />

      <ShimmerPlaceholder
        shimmerStyle={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 20,
          width: "50%",
          height: 30,
        }} // Cover full width
        autoRun={true}
        visible={false}
      />

      <View
        style={{
          marginTop: 30,
          width: "100%",
          display: "flex",
          alignItems: "left",
        }}
      >
        <ShimmerPlaceholder
          shimmerStyle={{ width: "50%", height: 20, marginBottom: 30 }} // Cover full width
          autoRun={true}
          visible={false}
        />
        <ShimmerPlaceholder
          shimmerStyle={{ width: "30%", height: 20, marginBottom: 30 }} // Cover full width
          autoRun={true}
          visible={false}
        />

        <ShimmerPlaceholder
          shimmerStyle={{
            width: "50%",
            height: 20,
            marginBottom: 30,
            marginTop: 20,
          }} // Cover full width
          autoRun={true}
          visible={false}
        />
        <ShimmerPlaceholder
          shimmerStyle={{ width: "30%", height: 20, marginBottom: 30 }} // Cover full width
          autoRun={true}
          visible={false}
        />
      </View>
    </View>
  );
};

const Profile = ({ route, navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [upenable, setUpEnable] = useState(false);
  const contentAnimatableRef = useRef(null);
  const headerAnimatableRef = useRef(null);
  const { employeeId } = route.params;

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const deleteProfileImage = async () => {
    toggleModal();
    try {
      if (!userData || !userData.imageUrl) {
        Alert.alert("Error", "No profile image found to delete.");
        return;
      }

      setIsUpdating(true);

      // Create a reference to the current profile image in storage
      const imageRef = storage().refFromURL(userData.imageUrl);

      // Delete the image from Firebase Storage
      await imageRef.delete();

      // Update the user's profile to remove the image URL
      const userRef = firestore().collection("Users").doc(userData.userid);
      await userRef.update({ imageUrl: null });

      setImageUri(null);

      // Optionally, remove the image URL from SecureStore
      await SecureStore.deleteItemAsync("userImageUrl");

      Alert.alert("Success", "Profile image deleted successfully!");
      // navigation.navigate("Main");
    } catch (error) {
      console.error("Error deleting profile image:", error);
      Alert.alert("Error", "Failed to delete profile image. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Create a reference to the "Users" collection
        const usersRef = firestore().collection("Users");

        // Query the collection for the user with the specified employeeId
        const querySnapshot = await usersRef
          .where("employeeId", "==", employeeId)
          .get();

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserData(userData);

          // Check if the user has an image URL
          if (userData.imageUrl) {
            setImageUri(userData.imageUrl);
          }
        } else {
          console.log("User not found");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [employeeId]);

  const pickImage = async () => {
    toggleModal();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      try {
        setIsUpdating(true); // Set loading state while updating profile picture

        const croppedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800, height: 800 } }],
          { format: "jpeg" }
        );

        if (userData.imageUrl) {
          const prevImageUrl = userData.imageUrl;
          const prevImageRef = firebase.storage().refFromURL(prevImageUrl);

          try {
            await prevImageRef.getDownloadURL();
            await prevImageRef.delete();
            console.log("Previous image deleted successfully");
            setUserData({ ...userData, imageUrl: null });
          } catch (error) {
            if (error.code === "storage/object-not-found") {
              // Previous image does not exist.
            } else {
              console.error("Error deleting previous image:", error);
            }
          }
        }

        setImageUri(croppedImage.uri);
        setUpEnable(true);

        const filename = croppedImage.uri.substring(
          croppedImage.uri.lastIndexOf("/") + 1
        );
        const ref = storage().ref(`/profileImages/${filename}`);

        const response = await ref.putFile(croppedImage.uri);
        const downloadURL = await getDownloadURL(ref);

        const userRef = firestore().collection("Users").doc(userData.userid);
        await userRef.update({ imageUrl: downloadURL });

        await SecureStore.setItemAsync("userImageUrl", downloadURL);
        setUpEnable(false);
        setImageUri(downloadURL);

        // navigation.navigate("Main");
      } catch (error) {
        console.error("Error updating profile picture:", error);
      } finally {
        setIsUpdating(false); // Set loading state back to false
      }
    }
  };

  const updateProfilePicture = async () => {
    try {
      if (!imageUri) {
        alert("Please select an image to update your profile picture.");
        return;
      }

      setIsUpdating(true);

      const { uri } = await FileSystem.getInfoAsync(imageUri);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1);

      const ref = storage().ref(`/profileImages/${filename}`); // Use backticks (`) for string interpolation

      const response = await ref.putFile(imageUri);

      const downloadURL = await getDownloadURL(ref);

      const userRef = firestore().collection("Users").doc(userData.userid);
      await userRef.update({ imageUrl: downloadURL });

      // To set an item
      await SecureStore.setItemAsync("userImageUrl", downloadURL);

      // Update the user's profile with the new image URL
      console.log(downloadURL);
      alert("Profile picture updated successfully!");
      setUpEnable(false);
      // Update the local state with the new image URL
      setImageUri(downloadURL);

      navigation.navigate("Main");
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // Animate the header's top position
    headerAnimatableRef.current.transitionTo(
      { height: "22%" },
      300,
      "ease-in-out"
    );

    // Animate the content's top position
    contentAnimatableRef.current.transitionTo(
      { top: "15%" },
      300,
      "ease-in-out"
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animatable.View
        ref={headerAnimatableRef}
        style={{
          width: "100%",
          height: "22%", //25
          marginBottom: 120,
          paddingTop: 20,
          paddingBottom: 40,

          backgroundColor: "#5BA646",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="chevron-back-outline"
            size={35}
            color="#fff"
            style={{ marginLeft: 15 }}
          />
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View
        ref={contentAnimatableRef}
        style={{
          marginTop: 20,
          position: "absolute",
          top: "15%", // Starting position, will be animated to 15%
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <ScrollView>
          {isUpdating ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator
                size="large"
                color="#5BA646"
                style={{ height: 500 }}
              />
            </View>
          ) : isLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SkeletonLoading />
            </View>
          ) : (
            !userData && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text>User not found</Text>
              </View>
            )
          )}

          {userData && !isLoading && !isUpdating && (
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <TouchableOpacity onPress={toggleModal}>
                {/* Profile Image */}
                <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : require("../../assets/icon.png")
                  }
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: 150,
                    backgroundColor: "gray",
                  }}
                />
              </TouchableOpacity>

              <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                style={{
                  flex: 1,
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                  }}
                  activeOpacity={1} // To prevent any interaction with the components below
                  onPress={toggleModal} // Close the modal when tapping outside of it
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      padding: 20,
                      borderRadius: 10,
                      width: "80%",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#5BA646",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 5,
                        opacity: isUpdating ? 0.6 : 1,
                        // Disable button when updating
                        pointerEvents: isUpdating ? "none" : "auto",
                      }}
                      disabled={isUpdating}
                      onPress={pickImage}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          textAlign: "center",
                          paddingHorizontal: 20,
                        }}
                      >
                        Change Profile Image
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={deleteProfileImage}
                      style={{
                        backgroundColor: imageUri ? "#ee4500" : "#808080", // Red color for delete button
                        paddingVertical: 10,
                        paddingHorizontal: 2,
                        borderRadius: 5,
                        marginTop: 20,
                        opacity: isUpdating ? 0.6 : 1,

                        // Disable button when updating
                        pointerEvents:
                          isUpdating || !imageUri ? "none" : "auto",
                      }}
                      disabled={isUpdating}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          textAlign: "center",
                          paddingHorizontal: 20,
                        }}
                      >
                        Delete Profile Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>

              <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
                {/* {upenable && (
                  <TouchableOpacity
                    onPress={updateProfilePicture}
                    style={{
                      backgroundColor: "#5BA646",
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                      marginBottom: 20,
                      opacity: isUpdating ? 0.6 : 1,
                      // Disable button when updating
                      pointerEvents: isUpdating ? "none" : "auto",
                    }}
                    disabled={isUpdating}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        textAlign: "center",
                        paddingHorizontal: 20,
                      }}
                    >
                      Update Picture
                    </Text>
                  </TouchableOpacity>
                )} */}

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    color: "#5BA646",
                    textAlign: "center",
                  }}
                >
                  {userData.name}
                </Text>
              </View>

              <View
                style={{
                  alignItems: "flex-start",
                  width: "100%",
                  marginTop: 40,
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    color: "#38A0ff",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  Employee ID
                </Text>
                <Text
                  style={{ fontSize: 20, color: "#888", marginVertical: 10 }}
                >
                  {userData.employeeId}
                </Text>

                {/* Add a line between sections */}
                <View
                  style={{
                    width: "100%",
                    borderBottomWidth: 1,
                    borderColor: "#ccc",
                    marginVertical: 20,
                  }}
                />

                <Text
                  style={{
                    color: "#38A0ff",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  Trade
                </Text>
                <Text
                  style={{ fontSize: 20, color: "#888", marginVertical: 10 }}
                >
                  {userData.trade}
                </Text>

                <View
                  style={{
                    width: "100%",
                    borderBottomWidth: 1,
                    borderColor: "#ccc",
                    marginVertical: 15,
                  }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </Animatable.View>
      {/* Display other user details here */}
    </View>
  );
};

export default Profile;
