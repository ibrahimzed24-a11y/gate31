import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.gate31.dj',
  appName: 'Gate 31',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: { SplashScreen: { launchShowDuration: 1200, backgroundColor: '#0a0a0f' } },
}
export default config