import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.bootia.penca',
  appName: 'Penca WC',
  // webDir is required by Capacitor CLI but not used when server.url is set
  webDir: 'public',
  server: {
    // Update this to your actual production URL before building for release
    url: 'https://penca-pwa.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
}

export default config
