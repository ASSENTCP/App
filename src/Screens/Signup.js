// import { View, Text, TextInput, TouchableOpacity } from "react-native";
// import React, { useState } from "react";
// import uuid from "react-native-uuid";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../../config";
// import * as SecureStore from "expo-secure-store";
// const Signup = ({ navigation }) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [selectedLanguage, setSelectedLanguage] = useState(""); // Add selected language state

//   const saveData = async () => {
//     const userId = uuid.v4();
//     try {
//       await setDoc(doc(db, "Users", userId), {
//         name: name,
//         userId: userId,
//         email: email,
//         language: selectedLanguage,
//         password: password, // Remember to hash the password before storing
//       });
//       try {
//         await SecureStore.setItemAsync("EMAIL", email);
//         await SecureStore.setItemAsync("NAME", name);
//         await SecureStore.setItemAsync("USERID", userId);
//         await SecureStore.setItemAsync("LANGUAGE", selectedLanguage);
//       } catch (error) {
//         console.error("Error saving data:", error);
//       }
//       alert("User Created!");
//       navigation.navigate("Login");
//       console.log("User Created!");
//     } catch (error) {
//       console.error("Error adding user:", error);
//     }
//   };

//   const styles = {
//     languageContainer: {
//       flexDirection: "row",
//       justifyContent: "center",
//       marginTop: 20,
//     },
//     languageButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderWidth: 1,
//       borderColor: "#ccc",
//       borderRadius: 20,
//       marginRight: 10,
//       backgroundColor: "transparent",
//     },
//     selectedButton: {
//       backgroundColor: "#5BA646",
//       borderColor: "#5BA646",
//     },
//     languageButtonText: {
//       fontSize: 16,
//       color: "#333",
//     },
//     selectedButtonText: {
//       color: "#fff",
//     },
//   };

//   return (
//     <View
//       style={{ flex: 1, justifyContent: "center", backgroundColor: "white" }}
//     >
//       <Text
//         style={{
//           fontSize: 20,
//           fontWeight: "800",
//           alignSelf: "center",
//           marginTop: 100,
//         }}
//       >
//         Sign up
//       </Text>
//       <TextInput
//         placeholder="Enter Name"
//         value={name}
//         onChangeText={(txt) => {
//           setName(txt);
//         }}
//         style={{
//           width: "80%",
//           height: 50,
//           fontSize: 18,
//           borderBottomWidth: 1,
//           borderColor: "#D1D1D1",
//           alignSelf: "center",
//           marginTop: 40,
//           paddingLeft: 0,
//         }}
//       />
//       <TextInput
//         placeholder="Enter Email Id"
//         value={email}
//         onChangeText={(txt) => {
//           setEmail(txt);
//         }}
//         style={{
//           width: "80%",
//           height: 50,
//           fontSize: 18,
//           borderColor: "#D1D1D1",
//           borderBottomWidth: 1,
//           alignSelf: "center",
//           marginTop: 20,
//           paddingLeft: 0,
//         }}
//       />

//       <TextInput
//         placeholder="Enter Password"
//         secureTextEntry={true}
//         value={password}
//         onChangeText={(txt) => {
//           setPassword(txt);
//         }}
//         style={{
//           width: "80%",
//           height: 50,
//           fontSize: 18,
//           borderColor: "#D1D1D1",
//           borderBottomWidth: 1,
//           alignSelf: "center",
//           marginTop: 20,
//           paddingLeft: 0,
//         }}
//       />

//       <View style={styles.languageContainer}>
//         <TouchableOpacity
//           onPress={() => setSelectedLanguage("English")}
//           style={[
//             styles.languageButton,
//             selectedLanguage === "English" && styles.selectedButton,
//           ]}
//         >
//           <Text
//             style={[
//               styles.languageButtonText,
//               selectedLanguage === "English" && styles.selectedButtonText,
//             ]}
//           >
//             English
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setSelectedLanguage("Hindi")}
//           style={[
//             styles.languageButton,
//             selectedLanguage === "Hindi" && styles.selectedButton,
//           ]}
//         >
//           <Text
//             style={[
//               styles.languageButtonText,
//               selectedLanguage === "Hindi" && styles.selectedButtonText,
//             ]}
//           >
//             Hindi
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => setSelectedLanguage("Arabic")}
//           style={[
//             styles.languageButton,
//             selectedLanguage === "Arabic" && styles.selectedButton,
//           ]}
//         >
//           <Text
//             style={[
//               styles.languageButtonText,
//               selectedLanguage === "Arabic" && styles.selectedButtonText,
//             ]}
//           >
//             Arabic
//           </Text>
//         </TouchableOpacity>
//       </View>
//       <TouchableOpacity
//         style={{
//           marginTop: 40,
//           width: "80%",
//           height: 50,
//           backgroundColor: "#5BA646",
//           alignSelf: "center",
//           justifyContent: "center",
//           alignItems: "center",
//           borderRadius: 10,
//         }}
//         onPress={() => {
//           if (
//             name !== "" &&
//             email !== "" &&
//             password !== "" &&
//             selectedLanguage !== ""
//           ) {
//             saveData();
//           } else {
//             alert("Please Enter All Data");
//           }
//         }}
//       >
//         <Text style={{ color: "#fff", fontSize: 18 }}>Sign up</Text>
//       </TouchableOpacity>
//       <Text
//         style={{
//           borderBottomWidth: 1,
//           borderColor: "#000",
//           fontSize: 16,
//           marginTop: 60,
//           alignSelf: "center",
//         }}
//         onPress={() => {
//           navigation.goBack();
//         }}
//       >
//         {"Already have account"}
//       </Text>
//     </View>
//   );
// };

// export default Signup;
