import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Profile Screen</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Dummy page content</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
});

export default ProfileScreen;
