import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prosushil',
  appName: 'prosushil_lifecare_app',
  webDir: 'public',
  server: {
    url: 'https://prosushil-lifecare.oktacon.com/', 
    cleartext: true
  }
};

export default config;