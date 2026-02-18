import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../context/ThemeContext';

const suggestions = [
  { icon: 'search', text: 'Search for anything' },
  { icon: 'sparkles', text: 'Brainstorm writing ideas' },
  { icon: 'pencil', text: 'Draft a project plan' },
];

const TwinkleScreen = () => {
  const navigation = useNavigation();
  const { palette } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={[palette.twinkleScreenStart, palette.twinkleScreenEnd]} style={styles.screenBg}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="rotate-ccw" size={18} color={palette.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
            <Icon name="external-link" size={18} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentBlock}>
          <LinearGradient
            colors={['#61A6FF', '#6A3CF3', '#001A89']}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.95, y: 0.95 }}
            style={styles.orb}
          />

          <Text style={styles.title}>How can I help you today?</Text>

          <View style={styles.suggestionList}>
            {suggestions.map((item) => (
              <TouchableOpacity key={item.text} style={styles.suggestionItem} activeOpacity={0.8}>
                <MaterialIcon name={item.icon} size={14} color={palette.textSecondary} />
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={12}
        >
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Ask Inf AI anything..."
              placeholderTextColor={palette.textSecondary}
              style={styles.input}
            />
            <TouchableOpacity activeOpacity={0.8} style={styles.micButton}>
              <Icon name="mic" size={16} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const createStyles = (palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    screenBg: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 6,
      paddingBottom: 10,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(24, 34, 52, 0.06)',
      borderWidth: 1,
      borderColor: palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(24, 34, 52, 0.12)',
    },
    contentBlock: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 18,
    },
    orb: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginBottom: 14,
      shadowColor: '#6854ff',
      shadowOpacity: 0.45,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    title: {
      fontSize: 18,
      lineHeight: 24,
      color: palette.textPrimary,
      fontWeight: '500',
      marginBottom: 18,
      letterSpacing: -0.5,
    },
    suggestionList: {
      gap: 12,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    suggestionText: {
      marginLeft: 10,
      fontSize: 14,
      color: palette.textSecondary,
      fontWeight: '400',
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: palette.twinkleInputBg,
      borderWidth: 1,
      borderColor: palette.twinkleInputBorder,
      paddingHorizontal: 14,
      marginBottom: 40,
    },
    input: {
      flex: 1,
      color: palette.textPrimary,
      fontSize: 14,
      paddingVertical: 11,
    },
    micButton: {
      marginLeft: 8,
      padding: 4,
    },
  });



export default TwinkleScreen;
