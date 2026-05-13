import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyos.app',
  appName: 'Study OS',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
