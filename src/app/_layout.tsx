import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ title: 'Registro' }} />
        <Stack.Screen name="inicio" options={{ headerShown: false }} />
        <Stack.Screen name="mascotas" options={{ title: 'Mis mascotas' }} />
        <Stack.Screen name="mascota-form" options={{ title: 'Mascota' }} />
        <Stack.Screen name="iniciar-paseo" options={{ title: 'Iniciar paseo' }} />
        <Stack.Screen
          name="paseo"
          options={{ title: 'Paseo en curso', headerBackVisible: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="paseo-resumen"
          options={{ title: 'Resumen del paseo', headerBackVisible: false, gestureEnabled: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
