import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  BackHandler,
  Image,
} from "react-native";
import { useWindowDimensions } from "react-native";
import {
  useIsFocused,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import ModalPicker from "../Components/ModalPicker";
import firestore from "@react-native-firebase/firestore"; // Import Firestore from @react-native-firebase/firestore
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { AppRegistry } from "react-native";
// import { BackHandler } from "react-native";

import ShimmerPlaceholder from "react-native-shimmer-placeholder";

const SkeletonLoading = () => {
  return (
    <View style={{ paddingHorizontal: 20, width: "100%" }}>
      <ShimmerPlaceholder
        shimmerStyle={{
          width: "50%",
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 20,
          marginTop: 40,
          height: 30,
        }} // Cover full width
        autoRun={true}
        visible={false}
      />

      <ShimmerPlaceholder
        shimmerStyle={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 20,
          width: "80%",
          height: 20,
        }} // Cover full width
        autoRun={true}
        visible={false}
      />

      <View style={{ marginBottom: 0 }}>
        <ShimmerPlaceholder
          shimmerStyle={{ width: "100%", height: 20, marginBottom: 10 }} // Cover full width
          autoRun={true}
          visible={false}
        />
        <ShimmerPlaceholder
          shimmerStyle={{ width: "100%", height: 20, marginBottom: 10 }} // Cover full width
          autoRun={true}
          visible={false}
        />
        <ShimmerPlaceholder
          shimmerStyle={{ width: "100%", height: 20, marginBottom: 10 }} // Cover full width
          autoRun={true}
          visible={false}
        />
      </View>
    </View>
  );
};

const Main = ({ navigation }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [upLang, setUpLang] = useState("English");
  const [userData, setUserData] = useState(null);
  const [isMainPage, setIsMainPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const isFocused = useIsFocused();
  const route = useRoute();
  const windowWidth = useWindowDimensions().width;
  const navigation2 = useNavigation();
  const logEmployeeId = route.params?.logEmployeeId;
  const logLang = route.params?.userLanguage;

  const fetchEmployeeId = async () => {
    try {
      if (logEmployeeId !== undefined) {
        setEmployeeId(logEmployeeId);
        setSelectedLanguage(logLang);
        setUpLang(logLang);
        profile();
      } else {
        const cleanedEmployeeId = await SecureStore.getItemAsync("EMPLOYEEID");

        const storedEmployeeId = cleanedEmployeeId.replace(/"/g, "");
        const storedLanguage = await SecureStore.getItemAsync("LANGUAGE");
        setSelectedLanguage(storedLanguage || "English");
        setUpLang(storedLanguage || "English");
        profile();
        setEmployeeId(storedEmployeeId || "");
      }
    } catch (error) {
      console.error("Error fetching Employee ID:", error);
    }
  };

  const updateLang = async (selectedLanguage) => {
    try {
      const employeeId = await SecureStore.getItemAsync("EMPLOYEEID");
      const storedEmployeeId = employeeId.replace(/"/g, "");
      const querySnapshot = await firestore()
        .collection("Users")
        .where("employeeId", "==", storedEmployeeId)
        .get();

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log(userData);

        const userRef = firestore().collection("Users").doc(userData.userid);

        await userRef.update({
          language: selectedLanguage,
        });

        await SecureStore.setItemAsync("LANGUAGE", selectedLanguage);
      } else {
        console.log("No user found with key: ", storedEmployeeId);
      }
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  const profile = async () => {
    try {
      const usersRef = firestore().collection("Users");
      const userDoc = await usersRef
        .where("employeeId", "==", employeeId)
        .get();

      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setUserData(userData);

        // Save the image URL to AsyncStorage
        if (userData.imageUrl) {
          // To set an item
          await SecureStore.setItemAsync("userImageUrl", userData.imageUrl);
        }
      } else {
        console.log("profile not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userImageUrl = await SecureStore.getItemAsync("userImageUrl");
        console.log("User image URL:", userImageUrl);
        if (userImageUrl) {
          // Use the image URL from AsyncStorage
          setUserData({ ...userData, imageUrl: userImageUrl });
        }
      } catch (error) {
        console.error("Error fetching user profile image:", error);
      }
    };

    fetchEmployeeId();
    profile();
    fetchProfileImage(); // Call the function to fetch and set the profile image
  }, []);

  useEffect(() => {
    const unsubscribe = navigation2.addListener("state", (e) => {
      // This callback will be triggered when the navigation state changes
      // Check if the current screen is "Main" and update the state accordingly

      const isMainPage =
        e.data.state.routes[e.data.state.index].name === "Main";
      setIsMainPage(isMainPage);
    });

    // Cleanup function to unsubscribe from the listener when the component unmounts
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      if (isMainPage) {
        if (Platform.OS === "ios") {
          AppRegistry.unmountApplicationComponentAtRootTag("root");
        } else {
          BackHandler.exitApp();
        }
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isMainPage]);

  // ... Previous code ...

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        profile();
        const postsRef = firestore().collection(selectedLanguage);
        const usersRef = firestore().collection("Users");
        const userDoc = await usersRef
          .where("employeeId", "==", employeeId)
          .get();

        const userData1 = userDoc.docs[0].data();
        const employeeCreationTimestamp = await userData1.timestamp;
        const q = postsRef
          .orderBy("timestamp", "desc")
          .where("timestamp", ">=", employeeCreationTimestamp);

        const unsubscribe = q.onSnapshot((querySnapshot) => {
          const postsData = [];
          querySnapshot.forEach((doc) => {
            const postData = doc.data();
            postData.id = doc.id;
            postData.employeeId = employeeId;

            // Calculate the time difference in hours
            if (postData.timestamp && postData.timestamp.seconds) {
              const postTimestamp = new Date(postData.timestamp.seconds * 1000);
              const currentTime = new Date();
              const timeDifference =
                (currentTime - postTimestamp) / (1000 * 60 * 60);

              // Add "new" to the title if the post is less than or equal to 12 hours old
              if (timeDifference <= 12) {
                postData.new = true;
              }
            }

            postsData.push(postData);
          });

          // Filter out posts where isDisabled is true
          const filteredPosts = postsData.filter((post) => !post.isDisabled);
          setPosts(filteredPosts);
          setIsLoading(false);
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [employeeId, isFocused, selectedLanguage]);

  const categorizedPosts = {
    Today: [],
    Yesterday: [],
    Previous: [],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  posts.forEach((post) => {
    if (post.timestamp && post.timestamp.seconds) {
      const postDate = new Date(post.timestamp.seconds * 1000);
      postDate.setHours(0, 0, 0, 0);

      const timeDifference = Math.floor(
        (today - postDate) / (1000 * 60 * 60 * 24)
      );

      if (timeDifference === 0) {
        categorizedPosts.Today.push(post);
      } else if (timeDifference === 1) {
        categorizedPosts.Yesterday.push(post);
      } else {
        categorizedPosts.Previous.push(post);
      }
    }
  });

  // ... Rest of your code ...

  return (
    <View style={{ flex: 1, backgroundColor: "#5BA646" }}>
      <StatusBar backgroundColor="#5BA646" barStyle="dark-content" />
      <View
        style={{
          width: "100%",
          height: "25%",
          paddingTop: 20,
          paddingBottom: 40,
          backgroundColor: "#5BA646",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* <TouchableOpacity onPress={() => navigation.navigate("Logout")}>
          <Text
            style={{
              color: "#fff",
              marginLeft: 20,
              fontSize: 32,
              fontWeight: "700",
            }}
          >
            Inbox
          </Text>
        </TouchableOpacity> */}
        <Text
          style={{
            color: "#fff",
            marginLeft: 20,
            fontSize: 32,
            fontWeight: "700",
          }}
        >
          Inbox
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 0,

            marginRight: 20,
          }}
        >
          <ModalPicker
            data={[
              { key: "English", label: "English" },
              { key: "हिंदी", label: "हिंदी" },
              { key: "বাংলা", label: "বাংলা" },
            ]}
            activelang={selectedLanguage}
            initValue={upLang}
            selectTextStyle={{ color: "#fff" }}
            onChange={(option) => {
              setSelectedLanguage(option.key);
              updateLang(option.key);
              setUpLang(option.label);
            }}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Profile", { employeeId: employeeId });
              setIsMainPage(false);
            }}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {userData && userData.imageUrl ? (
              <Image
                source={{ uri: userData.imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 35 / 2,
                  marginLeft: 15,
                }}
              />
            ) : (
              <Image
                source={require("../../assets/person.png")}
                style={{
                  width: 35,
                  height: 35,
                  borderRadius: 35 / 2,
                  marginLeft: 15,
                }}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          top: "20%",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "#fff",
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        <FlatList
          style={{
            backgroundColor: "#fff",
            display: "flex",
            width: "100%",
            height: "100%",
            marginBottom: 180,
          }}
          data={[
            { category: "Today", data: categorizedPosts.Today },
            { category: "Yesterday", data: categorizedPosts.Yesterday },
            { category: "Previous", data: categorizedPosts.Previous },
          ]}
          keyExtractor={(item) => item.category}
          renderItem={({ item }) =>
            !isLoading ? (
              <>
                {item.data.length > 0 && (
                  <Text
                    style={{
                      margin: 20,
                      fontSize: 24,
                      fontWeight: "700",
                      color: "#38A0FF",
                    }}
                  >
                    {item.category}
                  </Text>
                )}
                {item.data.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    onPress={() => {
                      navigation.navigate("PostDetails", { post: post });
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: "95%",
                        alignSelf: "center",
                        borderBottomWidth: 1,
                        borderColor: "rgba(225,225,225,0.8)",
                        backgroundColor: "#fff",
                        marginTop: 10,
                        borderRadius: 10,
                        marginBottom: 20,
                      }}
                    >
                      {post.new && (
                        <View
                          style={{
                            position: "absolute",
                            top: 15,
                            right: 15,
                            width: 12,
                            height: 12,
                            backgroundColor: "#38A0FF",
                            borderRadius: 10,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          marginTop: 5,
                          fontSize: 25,
                          fontWeight: "600",
                          marginLeft: 10,
                          marginRight: 30,
                        }}
                      >
                        {post.title
                          .replace(/<[^>]*>/g, "") // Remove HTML tags
                          .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
                          .substring(0, 50)}{" "}
                        {/* Get the first 50 characters */}
                        {post.title.length > 50 ? "..." : ""}
                      </Text>

                      <Text
                        style={{
                          margin: 10,
                          fontSize: 16,
                          fontWeight: "500",
                          color: "rgba(0,0,0,0.6)",
                        }}
                        numberOfLines={4}
                      >
                        {post.content
                          .replace(/<[^>]*>/g, "") // Remove HTML tags
                          .replace(/&nbsp;/g, " ") // Replace &nbsp; with regular space
                          .substring(0, 70)}{" "}
                        {/* Get the first 50 characters */}
                        {post.content.length > 70 ? "..." : ""}
                      </Text>

                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "left",
                            margin: 10,
                            fontSize: 14,
                            fontWeight: "400",
                            color: "#999",
                            marginLeft: 10,
                          }}
                        >
                          {post.timestamp && post.timestamp.seconds ? (
                            <>
                              {new Date(
                                post.timestamp.seconds * 1000
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </>
                          ) : (
                            "No Date"
                          )}
                        </Text>
                        <Text
                          style={{
                            textAlign: "left",
                            margin: 10,
                            fontSize: 14,
                            fontWeight: "400",
                            color: "#999",
                            marginLeft: 10,
                          }}
                        >
                          {post.timestamp && post.timestamp.seconds ? (
                            <>
                              {new Date(
                                post.timestamp.seconds * 1000
                              ).toLocaleDateString()}
                            </>
                          ) : (
                            "No Date"
                          )}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <SkeletonLoading />
            )
          }
        />
      </View>
    </View>
  );
};

export default Main;
