'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiMonitor,
  FiPhone,
  FiSend,
  FiX,
  FiMaximize,
  FiMinimize,
} from 'react-icons/fi';
import { lessonsAPI } from '@/lib/api';

interface VideoClassProps {
  lessonId: number;
  studentId: number;
  teacherId: number;
  studentName: string;
  teacherName: string;
  userRole: 'teacher' | 'student';
}

export default function VideoClass({
  lessonId,
  studentId,
  teacherId,
  studentName,
  teacherName,
  userRole,
}: VideoClassProps) {
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string; sender: string; time: Date}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [clientId, setClientId] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Generate clientId based on role and IDs
    const id = `${userRole}_${userRole === 'teacher' ? teacherId : studentId}_${Date.now()}`;
    setClientId(id);
  }, [userRole, teacherId, studentId]);

  useEffect(() => {
    const init = async () => {
      if (clientId) {
        await startLocalStream();
        initializeWebSocket();
      }
    };

    init();

    return () => {
      if (clientId) {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer effect - starts when call connects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionStatus === 'in-call' && !callStartTime) {
      setCallStartTime(Date.now());
    }

    if (connectionStatus === 'in-call' && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, callStartTime]);

  const initializeWebSocket = () => {
    // Use environment variable or default to localhost
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/signaling';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to signaling server');
      ws.send(JSON.stringify({ type: 'register', clientId }));
      setConnectionStatus('connected');
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data.type);

      switch (data.type) {
        case 'clients':
          console.log('Available clients:', data.clients);
          if (data.clients.length > 0 && !peerConnectionRef.current) {
            const targetClient = data.clients[0];
            if (clientId < targetClient) {
              console.log('Creating offer to:', targetClient);
              await createOffer(targetClient);
            }
          }
          break;

        case 'user-joined':
          console.log('User joined:', data.clientId);
          if (!peerConnectionRef.current && clientId < data.clientId) {
            await createOffer(data.clientId);
          }
          break;

        case 'offer':
          await handleOffer(data);
          break;

        case 'answer':
          await handleAnswer(data);
          break;

        case 'ice-candidate':
          await handleIceCandidate(data);
          break;

        case 'user-left':
          handleUserLeft();
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from signaling server');
      setConnectionStatus('disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      console.log('Local stream started');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        console.log('Audio-only stream started');
      } catch (audioError) {
        console.error('Audio access failed:', audioError);
        setConnectionStatus('error');
      }
    }
  };

  const createPeerConnection = (targetClientId: string) => {
    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          target: targetClientId
        }));
      }
    };

    const dataChannel = pc.createDataChannel('chat');
    setupDataChannel(dataChannel);

    pc.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('in-call');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionStatus('connected');
      }
    };

    return pc;
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;

    channel.onopen = () => {
      console.log('Data channel opened');
    };

    channel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, { text: data.text, sender: 'remote', time: new Date() }]);
      } else if (data.type === 'screen-share-status') {
        setIsRemoteScreenSharing(data.isSharing);
      } else if (data.type === 'call-ended') {
        setMessages(prev => [...prev, {
          text: `Call ended by ${userRole === 'teacher' ? studentName : teacherName}. Duration: ${data.duration}`,
          sender: 'system',
          time: new Date()
        }]);

        // End the lesson and cleanup when remote user ends call
        setTimeout(async () => {
          try {
            await lessonsAPI.stop(lessonId);
          } catch (error) {
            console.error('Error stopping lesson:', error);
          }
          cleanup();
          router.push(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
        }, 2000); // Give 2 seconds to show the message
      }
    };
  };

  const createOffer = async (targetClientId: string) => {
    try {
      const pc = createPeerConnection(targetClientId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      wsRef.current?.send(JSON.stringify({
        type: 'offer',
        offer: offer,
        target: targetClientId
      }));
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (data: any) => {
    try {
      const pc = createPeerConnection(data.from);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current?.send(JSON.stringify({
        type: 'answer',
        answer: answer,
        target: data.from
      }));
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const handleUserLeft = () => {
    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setConnectionStatus('connected');
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);

        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          dataChannelRef.current.send(JSON.stringify({ type: 'screen-share-status', isSharing: true }));
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
        alert('Could not share screen');
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && peerConnectionRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');

      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsScreenSharing(false);

      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        dataChannelRef.current.send(JSON.stringify({ type: 'screen-share-status', isSharing: false }));
      }
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify({
        type: 'chat',
        text: inputMessage.trim()
      }));
      setMessages(prev => [...prev, { text: inputMessage.trim(), sender: 'local', time: new Date() }]);
      setInputMessage('');
    }
  };

  const endCall = async () => {
    // Send call duration to chat
    if (callStartTime && dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      const duration = formatTime(callDuration);
      dataChannelRef.current.send(JSON.stringify({
        type: 'call-ended',
        duration: duration
      }));

      setMessages(prev => [...prev, {
        text: `Call ended. Duration: ${duration}`,
        sender: 'system',
        time: new Date()
      }]);
    }

    // End the lesson in the backend
    try {
      await lessonsAPI.stop(lessonId);
    } catch (error) {
      console.error('Error stopping lesson:', error);
    }

    cleanup();
    // Navigate back to dashboard
    router.push(userRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-lg font-semibold">
            {userRole === 'teacher' ? `Class with ${studentName}` : `Class with ${teacherName}`}
          </h1>
          {connectionStatus === 'in-call' && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              🔴 LIVE {formatTime(callDuration)}
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Waiting for peer...
            </div>
          )}
        </div>
        <button
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiPhone className="rotate-[135deg]" />
          <span>End Class</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Video Area */}
        <div className="flex-1 relative bg-gray-900 p-4">
          {/* Remote Video (large) */}
          <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'relative h-full'} bg-black rounded-lg overflow-hidden`}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
                Waiting for {userRole === 'teacher' ? studentName : teacherName} to join...
              </div>
            )}
            {isRemoteScreenSharing && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
                 Screen Sharing
              </div>
            )}
            <button
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white p-2 rounded-lg transition-all"
            >
              {isFullScreen ? <FiMinimize /> : <FiMaximize />}
            </button>
          </div>

          {/* Local Video (small, picture-in-picture) */}
          <div className="absolute bottom-8 right-8 w-64 h-48 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              You {isScreenSharing && '(Screen)'}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isAudioEnabled ? 'Mute' : 'Unmute'}
            >
              {isAudioEnabled ? <FiMic className="text-xl" /> : <FiMicOff className="text-xl" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? <FiVideo className="text-xl" /> : <FiVideoOff className="text-xl" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-4 rounded-full transition-all ${
                isScreenSharing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <FiMonitor className="text-xl" />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold text-lg">Class Chat</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.sender === 'system'
                    ? 'text-center'
                    : msg.sender === 'local'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }`}
              >
                {msg.sender === 'system' ? (
                  <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs">
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === 'local'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'local' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              >
                <FiSend className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
