import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

export const VideoCallContext = createContext();

const STUN_SERVERS = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
    { urls: ['stun:stun2.l.google.com:19302'] },
  ],
};

const CALL_TIMEOUT_MS = 45000;
const DISCONNECT_GRACE_MS = 6000;

const normalizeSessionDescription = (description) => {
  if (!description) {
    throw new Error('Invalid session description');
  }
  return description instanceof RTCSessionDescription
    ? description
    : new RTCSessionDescription(description);
};

const normalizeIceCandidate = (candidate) => {
  if (!candidate) {
    return null;
  }
  return candidate instanceof RTCIceCandidate
    ? candidate
    : new RTCIceCandidate(candidate);
};

export const VideoCallProvider = ({ children, serverURL }) => {
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteUserIdRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const disconnectTimerRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const callStateRef = useRef('idle');
  const incomingCallFromRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [callState, setCallState] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [currentCallUser, setCurrentCallUser] = useState(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    incomingCallFromRef.current = incomingCallFrom;
  }, [incomingCallFrom]);

  const verifyWebRTC = useCallback(() => {
    const checks = {
      RTCPeerConnection: !!RTCPeerConnection,
      RTCSessionDescription: !!RTCSessionDescription,
      RTCIceCandidate: !!RTCIceCandidate,
      mediaDevices: !!mediaDevices,
    };

    const allAvailable = Object.values(checks).every(Boolean);
    if (!allAvailable) {
      console.warn('WebRTC checks failed:', checks);
    }
    return allAvailable;
  }, []);

  const clearDisconnectTimer = useCallback(() => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
  }, []);

  const clearCallTimeout = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (!localStreamRef.current) {
      return;
    }

    localStreamRef.current.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const closePeerConnection = useCallback(() => {
    clearDisconnectTimer();

    const pc = peerConnectionRef.current;
    if (!pc) {
      return;
    }

    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.onconnectionstatechange = null;
    pc.oniceconnectionstatechange = null;

    try {
      pc.close();
    } catch (closeError) {
      console.warn('Peer close error:', closeError?.message);
    }

    peerConnectionRef.current = null;
  }, [clearDisconnectTimer]);

  const resetCall = useCallback((clearError = false) => {
    clearDisconnectTimer();
    clearCallTimeout();

    pendingOfferRef.current = null;
    remoteUserIdRef.current = null;

    closePeerConnection();
    stopLocalStream();

    setRemoteStream(null);
    setCallState('idle');
    setCurrentCallUser(null);
    setIncomingCallFrom(null);

    if (clearError) {
      setError(null);
    }
  }, [clearCallTimeout, clearDisconnectTimer, closePeerConnection, stopLocalStream]);

  const startLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    if (!mediaDevices?.getUserMedia) {
      throw new Error('mediaDevices.getUserMedia is unavailable');
    }

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
      },
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const applyRemoteDescription = useCallback(async (pc, description) => {
    await pc.setRemoteDescription(normalizeSessionDescription(description));
  }, []);

  const applyLocalDescription = useCallback(async (pc, description) => {
    await pc.setLocalDescription(normalizeSessionDescription(description));
  }, []);

  const createPeerConnection = useCallback((remoteUserId) => {
    if (!RTCPeerConnection) {
      throw new Error('RTCPeerConnection is unavailable');
    }

    closePeerConnection();
    clearDisconnectTimer();

    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionRef.current = pc;

    if (remoteUserId) {
      remoteUserIdRef.current = remoteUserId;
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current?.connected || !remoteUserIdRef.current) {
        return;
      }

      socketRef.current.emit('ice_candidate', {
        to: remoteUserIdRef.current,
        candidate: event.candidate,
      });
    };

    pc.ontrack = (event) => {
      if (event?.streams?.[0]) {
        setRemoteStream(event.streams[0]);
        return;
      }

      if (event?.track) {
        const fallbackStream = new MediaStream();
        fallbackStream.addTrack(event.track);
        setRemoteStream(fallbackStream);
      }
    };

    const handleConnectionState = () => {
      const state = pc.connectionState || pc.iceConnectionState;
      if (!state) {
        return;
      }

      if (state === 'connected') {
        clearDisconnectTimer();
        clearCallTimeout();
        setCallState('active');
        return;
      }

      if (state === 'disconnected') {
        clearDisconnectTimer();

        disconnectTimerRef.current = setTimeout(() => {
          const activePc = peerConnectionRef.current;
          const activeState = activePc?.connectionState || activePc?.iceConnectionState;

          if (activePc === pc && (activeState === 'disconnected' || activeState === 'failed' || activeState === 'closed')) {
            setError('Call disconnected');
            resetCall();
          }
        }, DISCONNECT_GRACE_MS);

        return;
      }

      if (state === 'failed' || state === 'closed') {
        setError(state === 'failed' ? 'Call connection failed' : 'Call ended');
        resetCall();
      }
    };

    pc.onconnectionstatechange = handleConnectionState;
    pc.oniceconnectionstatechange = handleConnectionState;

    return pc;
  }, [clearCallTimeout, clearDisconnectTimer, closePeerConnection, resetCall]);

  const handleAnswerReceived = useCallback(async (answer, fromUserId) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        return;
      }

      if (fromUserId) {
        remoteUserIdRef.current = fromUserId;
      }

      await applyRemoteDescription(pc, answer);
      clearCallTimeout();
      setCallState('active');
      setError(null);
    } catch (answerError) {
      setError(answerError?.message || 'Failed to apply call answer');
      resetCall();
    }
  }, [applyRemoteDescription, clearCallTimeout, resetCall]);

  const initializeSocket = useCallback((name) => {
    if (!name?.trim()) {
      setError('Please enter a valid user name');
      return;
    }

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const cleanName = name.trim();
    setUserName(cleanName);
    setError(null);

    const socket = io(serverURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setUserId(socket.id);
      setIsConnected(true);
      setError(null);
      socket.emit('register_user', { name: cleanName });
    });

    socket.on('users_list', (usersList) => {
      const otherUsers = usersList.filter((user) => user.id !== socket.id);
      setUsers(otherUsers);
    });

    socket.on('incoming_call', ({ from, fromName, offer }) => {
      if (callStateRef.current !== 'idle') {
        socket.emit('reject_call', { to: from });
        return;
      }

      remoteUserIdRef.current = from;
      pendingOfferRef.current = offer;

      const caller = { id: from, name: fromName || 'Unknown' };
      setIncomingCallFrom(caller);
      setCurrentCallUser(caller);
      setError(null);
      setCallState('incoming');
    });

    socket.on('call_accepted', ({ from, answer }) => {
      handleAnswerReceived(answer, from);
    });

    socket.on('call_rejected', () => {
      setError('Call rejected');
      resetCall();
    });

    socket.on('call_error', ({ message }) => {
      setError(message || 'Call failed');
      resetCall();
    });

    socket.on('ice_candidate', async ({ candidate }) => {
      try {
        const pc = peerConnectionRef.current;
        const normalizedCandidate = normalizeIceCandidate(candidate);

        if (!pc || !normalizedCandidate) {
          return;
        }

        await pc.addIceCandidate(normalizedCandidate);
      } catch (candidateError) {
        console.warn('Failed to add ICE candidate:', candidateError?.message);
      }
    });

    socket.on('call_ended', () => {
      setError(null);
      resetCall();
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      setUserId(null);
      setUsers([]);
      resetCall();
    });

    socket.on('connect_error', (connectError) => {
      const message = connectError?.message || 'Unable to connect to server';
      setError(message);

      Alert.alert(
        'Server Connection Failed',
        `Server: ${serverURL}\n\nError: ${message}\n\nMake sure:\n1. Server is running\n2. WiFi IP is correct\n3. Both devices are on the same network`,
        [{ text: 'OK' }],
      );
    });

    socket.on('error', (socketError) => {
      console.error('Socket error:', socketError);
    });
  }, [handleAnswerReceived, resetCall, serverURL]);

  const initiateCall = useCallback(async (targetUser) => {
    try {
      if (callStateRef.current !== 'idle') {
        return;
      }

      if (!targetUser?.id) {
        throw new Error('Invalid target user');
      }

      if (!socketRef.current?.connected) {
        throw new Error('Not connected to signaling server');
      }

      if (!verifyWebRTC()) {
        throw new Error('WebRTC is not initialized on this device');
      }

      setError(null);
      setCurrentCallUser(targetUser);
      setCallState('calling');
      remoteUserIdRef.current = targetUser.id;

      const stream = await startLocalStream();
      const pc = createPeerConnection(targetUser.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await applyLocalDescription(pc, offer);

      socketRef.current.emit('call_user', {
        targetUserId: targetUser.id,
        offer: pc.localDescription || offer,
      });

      clearCallTimeout();
      callTimeoutRef.current = setTimeout(() => {
        if (callStateRef.current === 'calling') {
          setError('Call timed out');
          resetCall();
        }
      }, CALL_TIMEOUT_MS);
    } catch (callError) {
      setError(callError?.message || 'Failed to initiate call');
      resetCall();
      throw callError;
    }
  }, [
    applyLocalDescription,
    clearCallTimeout,
    createPeerConnection,
    resetCall,
    startLocalStream,
    verifyWebRTC,
  ]);

  const acceptCall = useCallback(async () => {
    try {
      const caller = incomingCallFromRef.current;
      const offer = pendingOfferRef.current;

      if (!caller?.id || !offer) {
        throw new Error('Incoming call data is missing');
      }

      if (!socketRef.current?.connected) {
        throw new Error('Not connected to signaling server');
      }

      setError(null);
      remoteUserIdRef.current = caller.id;

      const stream = await startLocalStream();
      const pc = createPeerConnection(caller.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await applyRemoteDescription(pc, offer);
      const answer = await pc.createAnswer();
      await applyLocalDescription(pc, answer);

      socketRef.current.emit('accept_call', {
        to: caller.id,
        answer: pc.localDescription || answer,
      });

      pendingOfferRef.current = null;
      setCurrentCallUser(caller);
      setCallState('active');
    } catch (acceptError) {
      setError(acceptError?.message || 'Failed to accept call');
      resetCall();
    }
  }, [applyLocalDescription, applyRemoteDescription, createPeerConnection, resetCall, startLocalStream]);

  const rejectCall = useCallback(() => {
    const caller = incomingCallFromRef.current;
    if (socketRef.current?.connected && caller?.id) {
      socketRef.current.emit('reject_call', { to: caller.id });
    }

    setError(null);
    resetCall();
  }, [resetCall]);

  const endCall = useCallback(() => {
    const targetId = remoteUserIdRef.current || currentCallUser?.id || incomingCallFromRef.current?.id;
    if (socketRef.current?.connected && targetId) {
      socketRef.current.emit('end_call', { to: targetId });
    }

    setError(null);
    resetCall();
  }, [currentCallUser, resetCall]);

  const disconnect = useCallback(() => {
    resetCall(true);

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setUserId(null);
    setUsers([]);
  }, [resetCall]);

  useEffect(() => () => {
    disconnect();
  }, [disconnect]);

  const value = {
    isConnected,
    userId,
    userName,
    serverURL,
    initializeSocket,
    disconnect,
    users,
    callState,
    currentCallUser,
    incomingCallFrom,
    error,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    setError,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = React.useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};