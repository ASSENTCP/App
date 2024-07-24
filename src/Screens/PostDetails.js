import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { Video, ResizeMode } from "expo-av";
import HTML, { RenderHTML } from "react-native-render-html";
import { useWindowDimensions } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import ImageViewer from "react-native-image-zoom-viewer";
import CustomModalHeader from "./CustomModalHandler";

const PostDetails = ({ route, navigation }) => {
  const { title, content, imageUrl, timestamp } = route.params.post;
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const [imageLoading, setImageLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageHeight, setImageHeight] = useState(null); // State to store image height
  const [loadingProgress, setLoadingProgress] = useState(0); // State to track loading progress
  const isVideo = imageUrl && imageUrl.toLowerCase().includes(".mp4");
  const windowWidth = useWindowDimensions().width;
  const videoRef = useRef(null);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (imagePreviewVisible) {
          closeModal();
          return true;
        }
        return false;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [zoomedImageUri, setZoomedImageUri] = useState(null);

  const handleImagePress = (imageUrl) => {
    setZoomedImageUri(imageUrl);
    setImagePreviewVisible(true);
  };

  const closeModal = () => {
    setImagePreviewVisible(false);
  };

  const handleImageLoad = () => {
    // Image has finished loading
    setImageLoading(false);
    setIsImageLoaded(true);
  };

  const handleProgress = (event) => {
    // Update loading progress
    setLoadingProgress(event.nativeEvent.loaded / event.nativeEvent.total);
  };

  useEffect(() => {
    const preloadImage = async () => {
      try {
        const image = Image.prefetch(imageUrl, undefined, handleProgress);
        await image;
        setImageLoading(false);
        setIsImageLoaded(true);

        // Retrieve image dimensions
        Image.getSize(imageUrl, (width, height) => {
          // Calculate aspect ratio
          const aspectRatio = width / height;
          // Calculate height based on window width and aspect ratio
          const calculatedHeight = windowWidth / aspectRatio;
          // Set the image height state
          setImageHeight(calculatedHeight);
          // Set the aspect ratio state
          setAspectRatio(aspectRatio);
        });
      } catch (error) {
        console.error("Error preloading image:", error);
        setImageLoading(false);
        setIsImageLoaded(true);
      }
    };

    if (imageUrl && !isVideo) {
      preloadImage();
    }
  }, [imageUrl, isVideo]);
  return (
    <View style={{ flex: 1, backgroundColor: "#5BA646" }}>
      <Animatable.View
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
        style={{
          position: "absolute",
          top: "15%", //20
          left: 0,
          right: 0,
          bottom: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <ScrollView
          style={{
            flex: 1,
            width: "100%",
          }}
        >
          <View
            style={{
              padding: 20,
              marginBottom: 100,
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: "600",
                  marginBottom: 10,
                  marginRight: 10,
                  width: "80%",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  textAlign: "right",
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: "400",
                  color: "#999",
                  marginLeft: -50,
                }}
              >
                {timestamp && timestamp.seconds ? (
                  <>
                    {new Date(timestamp.seconds * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {"\n"}
                    {new Date(timestamp.seconds * 1000).toLocaleDateString()}
                  </>
                ) : (
                  "No Date"
                )}
              </Text>
            </View>

            <RenderHTML source={{ html: content }} contentWidth={windowWidth} />

            {isVideo ? (
              <View
                style={{
                  width: "100%",
                  backgroundColor: "gray",
                  borderRadius: 5,
                  marginTop: 20,
                  aspectRatio: aspectRatio,
                }}
              >
                <Video
                  ref={videoRef}
                  style={{
                    flex: 1,
                    height: "100%",
                    width: "100%",
                    resizeMode: "cover",
                  }}
                  source={{
                    uri: imageUrl,
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>
            ) : imageUrl ? (
              <TouchableOpacity
                onPress={() => handleImagePress(imageUrl)}
                style={{
                  width: "100%",
                  height: imageHeight, // Set the height dynamically
                  backgroundColor: imageLoading ? "gray" : "transparent",
                  marginTop: 20,
                  borderRadius: 10,
                }}
              >
                <ShimmerPlaceholder
                  style={{
                    width: "100%",
                    height: imageLoading ? 350 : "100%", // Set the height of the skeleton loading placeholder
                    borderRadius: 10,
                  }}
                  visible={!imageLoading} // Show the skeleton loading effect while imageLoading is true
                >
                  {isImageLoaded ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{
                        width: "100%",
                        height: "100%",
                        resizeMode: "contain",
                        alignSelf: "center",
                      }}
                      onLoad={handleImageLoad}
                    />
                  ) : (
                    <ActivityIndicator size="large" color="#0000ff" />
                  )}
                </ShimmerPlaceholder>
              </TouchableOpacity>
            ) : null}

            <Image
              source={require("../../assets/Assent.png")}
              resizeMode="contain"
              alignSelf="center"
              style={{ width: 150, height: 30, marginTop: 40 }}
            />
          </View>
        </ScrollView>
      </Animatable.View>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: "#000",
            position: "relative",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1} // Ensure the TouchableOpacity captures touch events
            onPress={closeModal} // Close the modal when tapping outside the image
          >
            <CustomModalHeader onBackPress={closeModal} />
            <ImageViewer
              imageUrls={[{ url: zoomedImageUri }]}
              enableSwipeDown
              onSwipeDown={closeModal}
              renderHeader={() => null}
              renderIndicator={() => null}
              enablePreload={true} // Optionally enable preloading for smoother interactions
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default PostDetails;
