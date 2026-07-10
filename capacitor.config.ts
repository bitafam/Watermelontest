import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.watermelon.detector",
  appName: "Watermelon Detector",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
