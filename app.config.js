module.exports = {
  expo: {
    name: "Our Reminders",
    slug: "our-reminders",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "ourreminders",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FFF7ED",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.ourreminders.app",
    },
    android: {
      package: "com.ourreminders.app",
      versionCode: 4,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#FFF7ED",
      },
      permissions: ["NOTIFICATIONS"],
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    plugins: [
      ["expo-router", { root: "./src/app" }],
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#F97316",
        },
      ],
    ],
    extra: {
      router: { root: "./src/app" },
      eas: { projectId: "f7566a01-cd1f-405a-8e82-ffedfdf1b692" },
    },
    owner: "kenhookia",
  },
};
