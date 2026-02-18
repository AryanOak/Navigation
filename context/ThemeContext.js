import React from 'react';

const darkPalette = {
  mode: 'dark',
  background: '#050608',
  card: '#101216',
  surface: '#232428',
  panel: '#2A2A2E',
  textPrimary: '#F1F4FA',
  textSecondary: '#A9B0BC',
  textMuted: '#7C8390',
  line: '#2D3138',
  border: '#252A33',
  icon: '#F2F4F8',
  active: '#35F28C',
  twinkleBg: 'rgba(20, 122, 78, 0.48)',
  twinkleBorder: 'rgba(143, 255, 197, 0.75)',
  sliderBg: 'rgba(255, 255, 255, 0.10)',
  sliderBorder: 'rgba(255, 255, 255, 0.18)',
  barBg: 'rgba(35, 36, 40, 0.88)',
  barBorder: 'rgba(255, 255, 255, 0.28)',
  headerPill: '#F2F4F8',
  twinkleScreenStart: '#121212',
  twinkleScreenEnd: '#0f0f0f',
  twinkleInputBg: 'rgba(255, 255, 255, 0.07)',
  twinkleInputBorder: 'rgba(255, 255, 255, 0.10)',
  searchHeaderBg: '#1A1A1E',
  searchHeaderText: '#F1F4FA',
  searchMenuBg: '#232428',
};

const lightPalette = {
  mode: 'light',
  background: '#F3F5F8',
  card: '#FFFFFF', 
  surface: '#F7F9FC', 
  panel: '#FFFFFF',
  textPrimary: '#10131A',
  textSecondary: '#5D6675',
  textMuted: '#8A92A3',
  line: '#DDE3EC',
  border: '#D7DDE8',
  icon: '#232A36',
  active: '#32B9FF',
  twinkleBg: 'rgba(117, 198, 255, 0.22)',
  twinkleBorder: 'rgba(95, 179, 255, 0.65)',
  sliderBg: 'rgba(98, 162, 255, 0.16)',
  sliderBorder: 'rgba(98, 162, 255, 0.30)',
  barBg: 'rgba(255, 255, 255, 0.92)',
  barBorder: 'rgba(30, 50, 80, 0.18)',
  headerPill: '#212633',
  twinkleScreenStart: '#FBFCFF',
  twinkleScreenEnd: '#EDF1F8',
  twinkleInputBg: '#F1F4FA',
  twinkleInputBorder: '#D8DFEA',
  searchHeaderBg: '#FFFFFF',
  searchHeaderText: '#10131A',
  searchMenuBg: '#F7F9FC',
};

const ThemeContext = React.createContext({
  isDark: true,
  palette: darkPalette,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = React.useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isDark,
      palette: isDark ? darkPalette : lightPalette,
      toggleTheme,
    }),
    [isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => React.useContext(ThemeContext);
