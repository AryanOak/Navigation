import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const menuItems = ['Profile', 'Settings', 'Logout'];

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const navigation = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuHeight = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    if (!menuOpen) {
      Animated.timing(menuHeight, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(menuHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setMenuOpen(!menuOpen);
  };

  const handleMenuItemPress = () => {
    navigation.navigate('Home');
    toggleMenu();
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.navbar, { backgroundColor: palette.searchHeaderBg, zIndex: 100, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="menu" size={24} color={palette.searchHeaderText} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: palette.searchHeaderText }]}>Page title</Text>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="heart-outline" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
            <Icon name="dots-vertical" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.menu,
          {
            height: menuHeight,
            backgroundColor: palette.searchMenuBg,
          },
        ]}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.menuItem}
            onPress={handleMenuItemPress}
          >
            <Text style={[styles.menuText, { color: palette.textPrimary }]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <View style={[styles.content, { paddingTop: 24 }]}>
        <Pressable
          style={{ flex: 1, width: '100%' }}
          onPress={() => menuOpen && toggleMenu()}
        >
          <Text style={[styles.title, { color: palette.textPrimary }]}>Search Screen</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Dummy page content</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  menu: {
    position: 'absolute',
    top: 95,
    right: 16,
    width: 155,
    overflow: 'hidden',
    zIndex: 101,
    borderRadius: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
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

export default SearchScreen;
