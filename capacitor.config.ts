import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amrita.ahaar',
  appName: 'Ahaar',
  webDir: 'build',
  plugins: {
    GooglePlus: {
      webClientId: '537339875503-1aeqfttk48u9838gnfdd5p53505igkpi.apps.googleusercontent.com.apps.googleusercontent.com',
      offline: true
    }
  }
};

export default config;
