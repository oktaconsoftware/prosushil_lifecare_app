import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prosushil.app', // 👈 Best to use your actual unique ID here
  appName: 'ProSushil Lifecare', // 👈 This is what shows on the phone home screen
  webDir: 'out', // 🚨 CRITICAL FIX: Next.js builds your app into the "out" folder
};

export default config;