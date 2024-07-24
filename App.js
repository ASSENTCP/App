import React, { useEffect, useState } from "react";
import { usePreventScreenCapture } from "expo-screen-capture";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
import messaging from "@react-native-firebase/messaging"; // Import Firebase messaging
import AppNavigator from "./src/AppNavigator";
import { AppState } from "react-native";

export default function App() {
  usePreventScreenCapture();

  const [unsubscribeForeground, setUnsubscribeForeground] = useState(null);
  const [unsubscribeBackground, setUnsubscribeBackground] = useState(null);

  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true, // Enable sound for notifications
        shouldSetBadge: false,
      }),
    });

    // Fetch updates on app launch
    async function onFetchUpdateAsync() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log(`Error fetching latest Expo update: ${error}`);
      }
    }

    onFetchUpdateAsync();

    // Register for push notifications
    const registerForPushNotificationsAsync = async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permission to receive push notifications denied");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
    };

    registerForPushNotificationsAsync();

    // Listen for foreground notifications
    const foregroundListener = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived:", JSON.stringify(remoteMessage));
      const { title, body } = remoteMessage.notification;

      // Schedule the notification only if the app is in the foreground
      if (AppState.currentState === "active") {
        Notifications.scheduleNotificationAsync({
          content: {
            title: title,
            body: body,
            sound: "default",
            color: "#ffffff",
            backgroundColor: "#FFFFFF",
          },
          trigger: null,
        });
      }

      // Handle foreground notifications here
      // Return a promise when you're done
      return Promise.resolve();
    });

    // Listen for background notifications

    // OKAY BUT KNOW IT IS TWO NOTIFCATION FOR BACK GROUND

    //ONE IS DUE TO FIRBASE AND OTHER IS BY EXPO IMPLEMENT ONLY ONE

    const backgroundListener = messaging().setBackgroundMessageHandler(
      async (remoteMessage) => {
        console.log("Background FCM message:", remoteMessage);
      }
    );

    setUnsubscribeForeground(() => foregroundListener);
    setUnsubscribeBackground(() => backgroundListener);

    return () => {
      unsubscribeForeground && unsubscribeForeground();
      unsubscribeBackground && unsubscribeBackground();
    };
  }, []);

  return <AppNavigator />;
}
