import type { CapacitorConfig } from '@capacitor/cli';

// Thin-shell pattern: the APK loads the live production site instead of
// bundling the built app — deploying the web app (vercel --prod) updates
// every installed copy on next open, no APK rebuild needed. webDir points
// at www-shell/, a placeholder Capacitor requires but which is never
// actually shown once server.url takes over; only the icon/splash and
// native shell live in the APK itself.
const config: CapacitorConfig = {
  appId: 'com.missionfauj.app',
  appName: 'MissionFauj',
  webDir: 'www-shell',
  server: {
    url: 'https://missionfauj.vercel.app',
    cleartext: false,
  },
};

export default config;
