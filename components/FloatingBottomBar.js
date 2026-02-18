import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';

const BASE_ICONS = ['home', 'search', 'chat', 'profile'];

const iconName = {
  home: 'home',
  search: 'search-outline',
  chat: 'chatbubble-outline',
  profile: 'person-outline',
};

const textLabel = {
  home: 'Home',
  search: 'Search',
  chat: 'Chat',
  profile: 'Profile',
};

const FloatingBottomBar = ({ activeTab }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [selected, setSelected] = useState(activeTab || 'home');
  const sliderX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeTab) {
      setSelected(activeTab);
    }
  }, [activeTab]);

  const slotWidth = useMemo(() => {
    if (!barWidth) {
      return 0;
    }
    return (barWidth - 20) / BASE_ICONS.length;
  }, [barWidth]);

  useEffect(() => {
    if (!slotWidth) {
      return;
    }
    const index = Math.max(BASE_ICONS.indexOf(selected), 0);
    const toValue = 10 + index * slotWidth + 3;
    Animated.spring(sliderX, {
      toValue,
      useNativeDriver: true,
      speed: 14,
      bounciness: 8,
    }).start();
  }, [selected, slotWidth, sliderX]);

  const onBasePress = (key) => {
    setSelected(key);

    if (key === 'home') {
      navigation.navigate('Home');
      return;
    }

    if (key === 'search') {
      navigation.navigate('Search');
      return;
    }

    if (key === 'chat') {
      navigation.navigate('Comment');
      return;
    }

    if (key === 'profile') {
      navigation.navigate('Profile');
    }
  };

  const onTwinklePress = () => {
    navigation.navigate('Twinkle');
  };

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 8 }]}>
      <View style={styles.row}>
        <View
          style={[
            styles.bar,
            {
              backgroundColor: palette.barBg,
              borderColor: palette.barBorder,
            },
          ]}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        >
          {slotWidth > 0 && (
            <Animated.View
              style={[
                styles.slider,
                {
                  width: slotWidth - 10,
                  transform: [{ translateX: sliderX }],
                  backgroundColor: palette.sliderBg,
                  borderColor: palette.sliderBorder,
                },
              ]}
            />
          )}

          {BASE_ICONS.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.iconButton}
              onPress={() => onBasePress(key)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={iconName[key]}
                size={key === 'chat' ? 22 : 24}
                color={selected === key ? palette.active : palette.icon}
              />
              <Text
                style={[
                  styles.iconLabel,
                  {
                    color: selected === key ? palette.active : palette.textPrimary,
                  },
                ]}
              >
                {textLabel[key]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.twinkleButton,
            {
              backgroundColor: palette.twinkleBg,
              borderColor: palette.twinkleBorder,
              shadowColor: palette.active,
            },
          ]}
          onPress={onTwinklePress}
          activeOpacity={0.9}
        >
          <Ionicons name="sparkles" size={24} color={palette.active} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
  },
  row: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bar: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    height: 47,
    top: 5,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  iconButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  twinkleButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0,
  },
});

export default FloatingBottomBar;
