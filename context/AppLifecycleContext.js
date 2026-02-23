import React, { createContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const AppLifecycleContext = createContext({
  commentDraft: '',
  setCommentDraft: () => {},
  userOnlineStatus: false,
  setUserOnlineStatus: () => {},
});

export const AppLifecycleProvider = ({ children }) => {
  const [commentDraft, setCommentDraft] = useState('');
  const [userOnlineStatus, setUserOnlineStatus] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const isAppResumingRef = useRef(false);

  // Handle app state changes for lifecycle management
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
      isAppResumingRef.current = true;
    }

    // App is going to background (onPause/onStop)
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Don't clear draft here - it should persist in context during screen navigation
    }

    appStateRef.current = nextAppState;
  };

  const value = {
    commentDraft,
    setCommentDraft,
    userOnlineStatus,
    setUserOnlineStatus,
    isAppResumingRef,
  };

  return (
    <AppLifecycleContext.Provider value={value}>
      {children}
    </AppLifecycleContext.Provider>
  );
};

export const useAppLifecycle = () => {
  const context = React.useContext(AppLifecycleContext);
  if (!context) {
    throw new Error('useAppLifecycle must be used within AppLifecycleProvider');
  }
  return context;
};
