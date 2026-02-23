import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, NativeModules } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import TwinkleScreen from './screens/TwinkleScreen';
import SearchScreen from './screens/SearchScreen';
import CommentScreen from './screens/CommentScreen';
import ProfileScreen from './screens/ProfileScreen';
import FloatingBottomBar from './components/FloatingBottomBar';
import { ThemeProvider, useAppTheme } from './context/ThemeContext';
import { AppLifecycleProvider } from './context/AppLifecycleContext';

const Stack = createStackNavigator();

const rightFadeInterpolator = ({ current, layouts }) => ({
  cardStyle: {
    opacity: current.progress,
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.2, 0],
        }),
      },
    ],
  },
});

const routeToTab = {
  Home: 'home',
  Search: 'search',
  Comment: 'chat',
  Profile: 'profile',
};

const AppShell = () => {
  const navigationRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = React.useState('Home');
  const { palette, isDark } = useAppTheme();

  React.useEffect(() => {
    if (isDark) {
      // Dark mode
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor(palette.background);
    } else {
      // Light mode
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor('#FFFFFF');
    }
    
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
      StatusBar.setHidden(false);
      
      // Set navigation bar color using native module
      try {
        const { NavigationBarModule } = NativeModules;
        if (NavigationBarModule) {
          const navBarColor = isDark ? '#050608' : '#FFFFFF';
          const isLightIcons = !isDark;
          NavigationBarModule.setNavigationBarColor(navBarColor, isLightIcons);
        }
      } catch (e) {
        // Silently handle if native module is not available
      }
    }
  }, [isDark, palette]);

  const paperTheme = React.useMemo(
    () => ({
      colors: {
        primary: palette.active,
        accent: palette.active,
        background: palette.background,
        surface: palette.surface,
        error: '#ef4444',
        text: palette.textPrimary,
        disabled: palette.textMuted,
        placeholder: palette.textSecondary,
      },
    }),
    [palette]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const initialRoute = navigationRef.getCurrentRoute()?.name ?? 'Home';
          setCurrentRoute(initialRoute);
        }}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute()?.name;
          if (route) {
            setCurrentRoute(route);
          }
        }}
      >
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: rightFadeInterpolator,
            transitionSpec: {
              open: {
                animation: 'timing',
                config: { duration: 240 },
              },
              close: {
                animation: 'timing',
                config: { duration: 210 },
              },
            },
            cardStyle: { backgroundColor: palette.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Comment" component={CommentScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Twinkle" component={TwinkleScreen} />
        </Stack.Navigator>

        {currentRoute !== 'Twinkle' && (
          <FloatingBottomBar activeTab={routeToTab[currentRoute] || 'home'} />
        )}
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppLifecycleProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </AppLifecycleProvider>
    </SafeAreaProvider>
  );
}
