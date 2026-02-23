import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, ToastAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useAppLifecycle } from '../context/AppLifecycleContext';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { userOnlineStatus, setUserOnlineStatus, isAppResumingRef } = useAppLifecycle();
  
  const appStateRef = useRef(AppState.currentState);
  const toastShownRef = useRef(false);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    const previousAppState = appStateRef.current;

    // App is coming back from background (onRestart)
    if (
      (previousAppState === 'background' || previousAppState === 'inactive') &&
      nextAppState === 'active'
    ) {
      // Show welcome back toast
      if (!toastShownRef.current) {
        ToastAndroid.show('👋 Welcome back!', ToastAndroid.LONG);
        toastShownRef.current = true;
        
        // Reset flag after toast
        setTimeout(() => {
          toastShownRef.current = false;
        }, 4000);
      }
    }

    appStateRef.current = nextAppState;
  };

  const handleShowStatus = () => {
    setUserOnlineStatus(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Profile Screen</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>onRestart & onDestroy Demo</Text>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: palette.surface }]}>
          <Ionicons name="information-circle-outline" size={20} color={palette.active} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoTitle, { color: palette.textPrimary }]}>
              How This Works
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Go to another app & return → see toast
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Click button → "user is online" shows
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Status stays across screens
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Swipe app away → status clears
            </Text>
          </View>
        </View>

        {/* Show Status Button */}
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: palette.active }]}
          onPress={handleShowStatus}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={20} color="#050608" />
          <Text style={styles.statusButtonText}>Show My Status</Text>
        </TouchableOpacity>

        {/* Online Status Badge */}
        {userOnlineStatus && (
          <View style={[styles.statusBadge, { backgroundColor: palette.surface, borderColor: palette.active }]}>
            <View style={[styles.statusDot, { backgroundColor: '#4ade80' }]} />
            <Text style={[styles.statusText, { color: palette.active }]}>
              User is Online
            </Text>
          </View>
        )}

        {/* Info Text */}
        {userOnlineStatus && (
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoSmallText, { color: palette.textSecondary }]}>
              ✓ This status persists across all screens
            </Text>
            <Text style={[styles.infoSmallText, { color: palette.textSecondary }]}>
              ✓ It stays even if you open other apps
            </Text>
            <Text style={[styles.infoSmallText, { color: palette.textSecondary }]}>
              ✗ Closes only when app is destroyed (swiped away)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  statusButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  statusButtonText: {
    color: '#050608',
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoTextContainer: {
    gap: 8,
  },
  infoSmallText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ProfileScreen;
