import 'react-native-url-polyfill/auto';
import "../global.css";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import 'react-native-reanimated';

import { initDb } from '@/lib/db';
import { AuthProvider } from '@/components/AuthProvider';

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

function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      style={{ paddingVertical: 8, paddingRight: 16, backgroundColor: 'transparent' }}
    >
      <Text style={{ color: '#2f95dc', fontSize: 17 }}>‹ Terug</Text>
    </Pressable>
  );
}


function RootLayoutNav() {
  return (
    <ThemeProvider value={{
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, background: '#fff', card: '#fff' },
    }}>
      <ShareIntentHandler />
      <Stack screenOptions={{
        contentStyle: { backgroundColor: '#fff' },
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: '#2f95dc',
        headerTitleStyle: { color: '#000' },
        headerBlurEffect: undefined,
        headerTransparent: false,
        animation: 'fade',
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="save/index" options={{ title: 'Recept opslaan', headerLeft: () => <BackButton /> }} />
        <Stack.Screen name="add-url/index" options={{ title: 'Voeg toe via URL', headerLeft: () => <BackButton /> }} />
        <Stack.Screen name="add-manual/index" options={{ title: 'Handmatig toevoegen', headerLeft: () => <BackButton /> }} />
        <Stack.Screen name="recipe/[id]" options={{
          headerShown: false,
          gestureEnabled: true,
        }} />
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <AuthProvider>
        <ShareIntentProvider>
          <RootLayoutNav />
        </ShareIntentProvider>
      </AuthProvider>
    </View>
  );
}
