import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const hamburgerMenuItems = [
  { label: 'Profile', icon: 'account-circle' },
  { label: 'Settings', icon: 'cog' },
  { label: 'Logout', icon: 'exit-to-app' },
];

const profileMenuItems = [
  { label: 'View Profile', icon: 'account' },
  { label: 'Edit Profile', icon: 'pencil' },
  { label: 'Account Settings', icon: 'cog-outline' },
  { label: 'Notifications', icon: 'bell-outline' },
  { label: 'Privacy & Security', icon: 'shield-account' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
  { label: 'Sign Out', icon: 'logout' },
];

const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const navigation = useNavigation();
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const [dotsMenuOpen, setDotsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const sidebarTranslateX = useState(new Animated.Value(-280))[0];
  const profileSidebarTranslateX = useState(new Animated.Value(280))[0];
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const dotsMenuHeight = useState(new Animated.Value(0))[0];

  const toggleHamburgerMenu = () => {
    const newState = !hamburgerMenuOpen;
    
    // Close other menus if open
    if (dotsMenuOpen) {
      animateDotsMenu(false);
      setDotsMenuOpen(false);
    }
    
    if (profileMenuOpen && newState) {
      // Close profile menu and open hamburger menu
      Animated.sequence([
        Animated.parallel([
          Animated.timing(profileSidebarTranslateX, {
            toValue: 280,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sidebarTranslateX, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      setProfileMenuOpen(false);
    } else if (newState) {
      // Just open hamburger menu
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close hamburger menu
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: -280,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setHamburgerMenuOpen(newState);
  };

  const toggleProfileMenu = () => {
    const newState = !profileMenuOpen;
    
    // Close other menus if open
    if (dotsMenuOpen) {
      animateDotsMenu(false);
      setDotsMenuOpen(false);
    }
    
    if (hamburgerMenuOpen && newState) {
      // Close hamburger menu and open profile menu
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sidebarTranslateX, {
            toValue: -280,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(profileSidebarTranslateX, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      setHamburgerMenuOpen(false);
    } else if (newState) {
      // Just open profile menu
      Animated.parallel([
        Animated.timing(profileSidebarTranslateX, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Close profile menu
      Animated.parallel([
        Animated.timing(profileSidebarTranslateX, {
          toValue: 280,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setProfileMenuOpen(newState);
  };

  const animateDotsMenu = (toOpen) => {
    Animated.timing(dotsMenuHeight, {
      toValue: toOpen ? 150 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleDotsMenu = () => {
    const newState = !dotsMenuOpen;
    
    // Close other menus if open
    if (hamburgerMenuOpen) {
      Animated.parallel([
        Animated.timing(sidebarTranslateX, {
          toValue: -280,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      setHamburgerMenuOpen(false);
    }
    
    if (profileMenuOpen) {
      Animated.parallel([
        Animated.timing(profileSidebarTranslateX, {
          toValue: 280,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      setProfileMenuOpen(false);
    }
    
    if (newState) {
      animateDotsMenu(true);
    } else {
      animateDotsMenu(false);
    }
    setDotsMenuOpen(newState);
  };

  const handleDotsMenuItemPress = () => {
    toggleDotsMenu();
  };

  const handleMenuItemPress = (item) => {
    toggleHamburgerMenu();
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.navbar, { backgroundColor: palette.searchHeaderBg, zIndex: 100, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleHamburgerMenu}>
          <Icon name="menu" size={24} color={palette.searchHeaderText} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: palette.searchHeaderText }]}>Page title</Text>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleDotsMenu}>
            <Icon name="dots-vertical" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="magnify" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleProfileMenu}>
            <Icon name="account-circle" size={24} color={palette.searchHeaderText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
        pointerEvents={hamburgerMenuOpen || profileMenuOpen ? 'auto' : 'none'}
      >
        <Pressable
          style={styles.overlayPressable}
          onPress={() => {
            if (hamburgerMenuOpen) {
              toggleHamburgerMenu();
            }
            if (profileMenuOpen) {
              toggleProfileMenu();
            }
          }}
        />
      </Animated.View>

      {/* Dots Menu Dropdown */}
      <Animated.View
        style={[
          styles.dotsMenu,
          {
            height: dotsMenuHeight,
            backgroundColor: palette.searchMenuBg,
          },
        ]}
      >
        {hamburgerMenuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.dotsMenuItem}
            onPress={handleDotsMenuItemPress}
          >
            <Text style={[styles.dotsMenuText, { color: palette.textPrimary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Dots Menu Overlay */}
      {dotsMenuOpen && (
        <Pressable
          style={styles.dotsMenuOverlay}
          onPress={toggleDotsMenu}
        />
      )}

      {/* Sidebar Menu - Left */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: sidebarTranslateX }],
            backgroundColor: palette.searchMenuBg,
          },
        ]}
      >
        <View style={[styles.sidebarHeader, { borderBottomColor: palette.textSecondary }]}>
          <Text style={[styles.sidebarHeaderText, { color: palette.textPrimary }]}>Menu</Text>
        </View>
        {hamburgerMenuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.sidebarMenuItem}
            onPress={() => handleMenuItemPress(item.label)}
          >
            <Icon
              name={item.icon}
              size={20}
              color={palette.textPrimary}
              style={styles.sidebarMenuIcon}
            />
            <Text style={[styles.sidebarMenuText, { color: palette.textPrimary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Profile Sidebar Menu - Right */}
      <Animated.View
        style={[
          styles.profileSidebar,
          {
            transform: [{ translateX: profileSidebarTranslateX }],
            backgroundColor: palette.searchMenuBg,
          },
        ]}
      >
        <View style={[styles.profileSidebarHeader, { borderBottomColor: palette.textSecondary }]}>
          <Text style={[styles.profileSidebarHeaderText, { color: palette.textPrimary }]}>Profile</Text>
        </View>
        {profileMenuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.profileSidebarMenuItem}
            onPress={() => toggleProfileMenu()}
          >
            <Icon
              name={item.icon}
              size={20}
              color={palette.textPrimary}
              style={styles.profileSidebarMenuIcon}
            />
            <Text style={[styles.profileSidebarMenuText, { color: palette.textPrimary }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <View style={[styles.content, { paddingTop: 24 }]}>
        <Pressable
          style={{ flex: 1, width: '100%' }}
          onPress={() => {
            if (hamburgerMenuOpen) {
              toggleHamburgerMenu();
            }
            if (dotsMenuOpen) {
              toggleDotsMenu();
            }
            if (profileMenuOpen) {
              toggleProfileMenu();
            }
          }}
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  overlayPressable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    zIndex: 102,
    paddingTop: 80,
    paddingHorizontal: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 5, height: 0 },
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  sidebarMenuIcon: {
    marginRight: 16,
    width: 24,
  },
  sidebarMenuText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  sidebarHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  sidebarHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  profileSidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 280,
    height: '100%',
    zIndex: 102,
    paddingTop: 80,
    paddingHorizontal: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: -5, height: 0 },
  },
  profileSidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  profileSidebarMenuIcon: {
    marginRight: 16,
    width: 24,
  },
  profileSidebarMenuText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  profileSidebarHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1.5,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  profileSidebarHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotsMenu: {
    position: 'absolute',
    top: 70,
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
  dotsMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  dotsMenuText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dotsMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
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
