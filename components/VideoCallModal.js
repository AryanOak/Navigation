import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useVideoCall } from '../context/VideoCallContext';

const VideoCallModal = ({ visible, onClose }) => {
  const { palette } = useAppTheme();
  const {
    isConnected,
    serverURL,
    userName,
    users,
    callState,
    currentCallUser,
    incomingCallFrom,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    error,
    setError,
    initializeSocket,
  } = useVideoCall();

  const [userNameInput, setUserNameInput] = useState(userName || 'User' + Math.floor(Math.random() * 1000));
  const [showUserNameInput, setShowUserNameInput] = useState(!isConnected);
  const [isCallPending, setIsCallPending] = useState(false);

  // Initialize socket connection when modal opens
  useEffect(() => {
    if (visible && !isConnected && !showUserNameInput) {
      console.log('Initializing socket with name:', userNameInput);
      initializeSocket(userNameInput);
    }
  }, [visible, isConnected, showUserNameInput, userNameInput, initializeSocket]);

  // Request permissions
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      requestPermissions();
    }
  }, [visible]);

  const requestPermissions = async () => {
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);

      const cameraGranted = results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
      const audioGranted = results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

      console.log('Camera:', cameraGranted, 'Audio:', audioGranted);

      if (!cameraGranted || !audioGranted) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required for video calling.\n\nGo to Settings > Apps > Your App > Permissions and enable Camera and Microphone.',
          [
            { 
              text: 'Open Settings', 
              onPress: () => {
                Linking.openSettings();
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return false;
      }
      
      return true;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const handleClose = () => {
    if (callState === 'active' || callState === 'calling' || callState === 'incoming') {
      Alert.alert(
        'End Call',
        'Are you sure you want to end the call?',
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'End Call', onPress: () => { endCall(); onClose(); } },
        ]
      );
    } else {
      onClose();
    }
  };

  const handleCallUser = async (user) => {
    if (isCallPending) {
      console.log('Call already in progress, ignoring');
      return;
    }

    setIsCallPending(true);
    try {
      console.log('=== HANDLE CALL USER START ===');
      console.log('User:', user?.name);
      
      if (Platform.OS === 'android') {
        console.log('Requesting permissions...');
        const hasPermissions = await requestPermissions();
        if (!hasPermissions) {
          console.log('Permissions denied');
          Alert.alert('Error', 'Camera and microphone permissions are required to make calls');
          setIsCallPending(false);
          return;
        }
      }
      
      console.log('Calling initiateCall...');
      await initiateCall(user);
      console.log('=== HANDLE CALL USER END ===');
    } catch (err) {
      console.error('=== HANDLE CALL USER ERROR ===');
      console.error('Error caught:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      
      const errorMsg = err?.message || 'Unknown error occurred';
      setError(`CALL ERROR: ${errorMsg}`);
      
      Alert.alert(
        'Call Failed',
        errorMsg,
        [{ text: 'OK', onPress: () => setError(null) }]
      );
    } finally {
      setTimeout(() => setIsCallPending(false), 1000);
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.border }]}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={palette.icon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Video Call</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Error Alert */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: '#dc2626' }]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleErrorClose}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <View style={[styles.statusBanner, { backgroundColor: palette.surface }]}>
            <View style={styles.statusContent}>
              <Ionicons name="wifi" size={16} color={palette.textSecondary} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.statusText, { color: palette.textSecondary }]}>
                  Connecting to server...
                </Text>
                <Text style={[styles.statusSubtext, { color: palette.textMuted }]}>
                  {serverURL}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* User Name Input */}
        {showUserNameInput && (
          <View style={[styles.inputSection, { backgroundColor: palette.surface }]}>
            <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Enter your name:</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.textInput, { color: palette.textPrimary, borderColor: palette.border }]}
                placeholder="Your name"
                placeholderTextColor={palette.textMuted}
                value={userNameInput}
                onChangeText={setUserNameInput}
                editable={true}
              />
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: palette.active }]}
                onPress={async () => {
                  // Request permissions when user confirms name
                  if (Platform.OS === 'android') {
                    await requestPermissions();
                  }
                  setShowUserNameInput(false);
                }}
              >
                <Ionicons name="checkmark" size={20} color="#050608" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Content */}
        <ScrollView style={styles.content}>
          {callState === 'idle' && (
            <>
              {/* Users List */}
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Available Users
              </Text>

              {/* Error Display */}
              {error && (
                <View style={[styles.errorBox, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text style={[styles.errorText, { color: '#991b1b' }]}>
                    {error}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setError(null)}
                    style={{ padding: 8 }}
                  >
                    <Ionicons name="close" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}

              {users.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: palette.surface }]}>
                  <Ionicons name="people-outline" size={48} color={palette.textMuted} />
                  <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                    No other users available
                  </Text>
                  <Text style={[styles.emptySubtext, { color: palette.textMuted }]}>
                    Wait for other users to join or ask your friends to open the app
                  </Text>
                </View>
              ) : (
                <View style={styles.usersList}>
                  {users.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      style={[styles.userCard, { backgroundColor: palette.surface, borderColor: palette.border, opacity: isCallPending ? 0.5 : 1 }]}
                      onPress={() => handleCallUser(user)}
                      disabled={isCallPending}
                      activeOpacity={0.7}
                    >
                      <View style={styles.userInfo}>
                        <Ionicons name="person-circle" size={40} color={palette.active} />
                        <View style={styles.userDetails}>
                          <Text style={[styles.userName, { color: palette.textPrimary }]}>
                            {user.name}
                          </Text>
                          <Text style={[styles.userId, { color: palette.textSecondary }]}>
                            {user.id.slice(0, 8)}...
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="call" size={24} color={palette.active} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {callState === 'calling' && (
            <View style={styles.callingSection}>
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
                  <Ionicons name="alert-circle" size={24} color="#dc2626" />
                  <Text style={[styles.errorBoxText, { color: '#991b1b' }]}>
                    {error}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={[styles.callingCard, { backgroundColor: palette.surface }]}>
                    <Ionicons name="call" size={48} color={palette.active} />
                    <Text style={[styles.callingText, { color: palette.textPrimary }]}>
                      Calling {currentCallUser?.name}...
                    </Text>
                    <Text style={[styles.callingSubtext, { color: palette.textSecondary }]}>
                      Waiting for response
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { backgroundColor: '#dc2626' }]}
                    onPress={endCall}
                  >
                    <Ionicons name="close" size={20} color="white" />
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {callState === 'incoming' && (
            <View style={styles.incomingSection}>
              <View style={[styles.incomingCard, { backgroundColor: palette.surface }]}>
                <Ionicons name="person-circle" size={64} color={palette.active} />
                <Text style={[styles.incomingName, { color: palette.textPrimary }]}>
                  {incomingCallFrom?.name}
                </Text>
                <Text style={[styles.incomingText, { color: palette.textSecondary }]}>
                  is calling...
                </Text>
              </View>
              <View style={styles.incomingButtonsRow}>
                <TouchableOpacity
                  style={[styles.rejectBtn, { backgroundColor: '#dc2626' }]}
                  onPress={rejectCall}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: '#22c55e' }]}
                  onPress={acceptCall}
                >
                  <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {callState === 'active' && (
            <View style={styles.activeCallSection}>
              {/* Remote Video */}
              {remoteStream ? (
                <RTCView
                  streamURL={remoteStream.toURL()}
                  style={styles.remoteVideo}
                  objectFit="cover"
                />
              ) : (
                <View style={[styles.remoteVideoPlaceholder, { backgroundColor: palette.surface }]}>
                  <Ionicons name="videocam-off" size={48} color={palette.textMuted} />
                  <Text style={[styles.placeholderText, { color: palette.textMuted }]}>
                    Waiting for video...
                  </Text>
                </View>
              )}

              {/* Local Video */}
              {localStream && (
                <RTCView
                  streamURL={localStream.toURL()}
                  style={styles.localVideo}
                  objectFit="cover"
                />
              )}

              {/* Call Controls */}
              <View style={[styles.callControls, { backgroundColor: palette.surface + '90' }]}>
                <TouchableOpacity
                  style={[styles.controlBtn, { backgroundColor: '#dc2626' }]}
                  onPress={endCall}
                >
                  <Ionicons name="call" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    fontWeight: '600',
  },
  statusBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  confirmBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyState: {
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userId: {
    fontSize: 12,
    marginTop: 4,
  },
  callingSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  callingCard: {
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  callingText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  callingSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  cancelBtn: {
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  incomingSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  incomingCard: {
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  incomingName: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  incomingText: {
    fontSize: 16,
    marginTop: 8,
  },
  incomingButtonsRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  rejectBtn: {
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCallSection: {
    flex: 1,
    position: 'relative',
    marginTop: 12,
    height: 400,
  },
  remoteVideo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  remoteVideoPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
  },
  localVideo: {
    width: 120,
    height: 160,
    borderRadius: 12,
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#000',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  controlBtn: {
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  errorBoxText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default VideoCallModal;
