import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { initDb } from '@/lib/db';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function ShareIntentHandler() {
  const router = useRouter();
  const { hasShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (hasShareIntent) {
      router.replace('/save');
    }
  }, [hasShareIntent, router]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ShareIntentHandler />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="save/index" options={{ title: 'Recept opslaan', headerBackTitle: 'Terug' }} />
        <Stack.Screen name="add-url/index" options={{ title: 'Voeg toe via URL', headerBackTitle: 'Terug' }} />
        <Stack.Screen name="recipe/[id]" options={{ title: 'Recept', headerBackTitle: 'Terug' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      initDb();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ShareIntentProvider>
      <RootLayoutNav />
    </ShareIntentProvider>
  );
}
