import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { getStorage, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";
import { firebase, db } from "../../config"; // Make sure to import your Firestore instance
import * as ImagePicker from "expo-image-picker"; // Import Expo's image picker module
import * as FileSystem from "expo-file-system";

const AddNewBlog = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(""); // Add selected language state

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddPost = async () => {
    if (title && content && selectedLanguage) {
      const storage = getStorage(); // Initialize Firebase Storage

      try {
        let downloadURL = null;

        if (imageUri) {
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
          const ref = firebase.storage().ref().child(filename);
          await ref.put(blob);

          downloadURL = await getDownloadURL(ref);
        }

        const postId = uuid.v4(); // Generate a new UUID for the post
        const postDocRef = doc(db, `${selectedLanguage}`, postId); // Reference the document with the postId

        await setDoc(postDocRef, {
          id: postId, // Use the same UUID as the post ID
          title: title,
          content: content,
          imageUrl: downloadURL,
          timestamp: serverTimestamp(),
        });

        console.log("Post created successfully with ID:", postId);
        navigation.goBack();
      } catch (error) {
        console.error("Error creating post:", error);
      }
    } else {
      alert("Please enter title, content, and select a language.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Add New Post
      </Text>
      {/* Add language selector buttons */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => setSelectedLanguage("English")}
          style={{
            backgroundColor:
              selectedLanguage === "English" ? "#5BA646" : "#ccc",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#fff" }}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedLanguage("हिंदी")}
          style={{
            backgroundColor: selectedLanguage === "हिंदी" ? "#5BA646" : "#ccc",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <Text style={{ color: "#fff" }}>हिंदी</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedLanguage("বাংলা")}
          style={{
            backgroundColor: selectedLanguage === "বাংলা" ? "#5BA646" : "#ccc",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>বাংলা</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={(text) => setTitle(text)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Content"
        value={content}
        onChangeText={(text) => setContent(text)}
        multiline
        numberOfLines={4}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 10,
          marginBottom: 20,
          height: 150, // Define the desired height here
        }}
      />

      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: "#5BA646",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Pick Image</Text>
      </TouchableOpacity>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 100, height: 100, marginTop: 10 }}
        />
      )}
      <TouchableOpacity
        onPress={handleAddPost}
        style={{
          backgroundColor: "#5BA646",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff" }}>Add Post</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddNewBlog;
