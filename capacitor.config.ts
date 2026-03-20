
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globlync.app',
  appName: 'Globlync',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#00796B",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#FFC107"
    }
  }
};

export default config;
