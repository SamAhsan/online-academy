'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import { messagesAPI, dashboardAPI, studentsAPI, teachersAPI } from '@/lib/api';
import {
  FiMessageCircle,
  FiSend,
  FiUser,
  FiX,
  FiRefreshCw,
  FiPlus,
  FiUsers,
} from 'react-icons/fi';

interface Conversation {
  user_id: number;
  user_name: string;
  user_role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  sent_at: string;
  is_read: boolean;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';
    setUserRole(role);
    fetchConversations();
    fetchAvailableUsers(role);
    // Refresh conversations every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.user_id);
      // Refresh messages every 3 seconds when a conversation is open
      const interval = setInterval(() => fetchMessages(selectedConversation.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const convos = await messagesAPI.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (role: string) => {
    try {
      if (role === 'teacher') {
        // Fetch teacher's students
        const dashboardData = await dashboardAPI.getTeacherDashboard();
        setAvailableUsers(dashboardData.students || []);
      } else if (role === 'student') {
        // Fetch student's assigned teacher
        const dashboardData = await dashboardAPI.getStudentDashboard();
        if (dashboardData.assigned_teacher_name) {
          // We need to get the teacher's user_id
          // For now, we'll create a simple object
          setAvailableUsers([{
            id: dashboardData.assigned_teacher_id,
            name: dashboardData.assigned_teacher_name,
            user_id: dashboardData.teacher_user_id, // We'll need to add this to the backend
          }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch available users:', error);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const msgs = await messagesAPI.getMessagesWith(userId);
      setMessages(msgs);

      // Get current user ID from first message (if any)
      if (msgs.length > 0 && !currentUserId) {
        const firstMsg = msgs[0];
        // If we sent the first message, use sender_id, otherwise use receiver_id
        const convUser = conversations.find(c => c.user_id === userId);
        if (convUser) {
          setCurrentUserId(firstMsg.sender_id === userId ? firstMsg.receiver_id : firstMsg.sender_id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStartNewChat = (user: any) => {
    // Create a conversation object from the user
    const newConversation: Conversation = {
      user_id: user.user_id,
      user_name: user.name,
      user_role: userRole === 'teacher' ? 'student' : 'teacher',
      last_message: '',
      last_message_time: new Date().toISOString(),
      unread_count: 0,
    };
    setSelectedConversation(newConversation);
    setShowNewChatModal(false);
    setMessages([]); // Clear messages for new conversation
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      await messagesAPI.send({
        receiver_id: selectedConversation.user_id,
        message: newMessage.trim(),
      });
      setNewMessage('');
      await fetchMessages(selectedConversation.user_id);
      await fetchConversations(); // Refresh conversations to update last message
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-6">
          <FiMessageCircle className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="md:col-span-1 card overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-3 border-b">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="text-blue-600 hover:text-blue-700"
                  title="New Chat"
                >
                  <FiPlus className="text-xl" />
                </button>
                <button
                  onClick={fetchConversations}
                  className="text-gray-500 hover:text-gray-700"
                  title="Refresh"
                >
                  <FiRefreshCw className="text-xl" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.user_id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.user_id === conversation.user_id
                      ? 'bg-blue-50 border-2 border-blue-300'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <FiUser className="text-gray-600" />
                      <span className="font-semibold text-gray-800">
                        {conversation.user_name}
                      </span>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(conversation.user_role)}`}>
                    {conversation.user_role}
                  </span>
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    {conversation.last_message}
                  </p>
                  {conversation.last_message_time && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.last_message_time).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <FiMessageCircle className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with your teacher or students!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 card flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedConversation.user_name}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadgeColor(selectedConversation.user_role)}`}>
                      {selectedConversation.user_role}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-500 hover:text-gray-700 md:hidden"
                  >
                    <FiX className="text-2xl" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {messages.map((message) => {
                    const isSentByMe = currentUserId ? message.sender_id !== selectedConversation.user_id : message.receiver_id === selectedConversation.user_id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isSentByMe
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.message}</p>
                          <p className={`text-xs mt-1 ${isSentByMe ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.sent_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="pt-4 border-t">
                  <div className="flex space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="input flex-1 resize-none"
                      rows={2}
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="btn btn-primary flex items-center justify-center px-6"
                    >
                      <FiSend className="text-xl" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FiMessageCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <FiUsers className="text-blue-600" />
                  <span>Start New Chat</span>
                </h2>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="text-2xl" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {userRole === 'teacher' ? 'Select a student to chat with:' : 'Select your teacher:'}
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartNewChat(user)}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FiUser className="text-gray-600 text-xl" />
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        {user.parent_contact && (
                          <p className="text-xs text-gray-500">{user.parent_contact}</p>
                        )}
                        {user.teams_id && (
                          <p className="text-xs text-blue-600">Teams: {user.teams_id}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {availableUsers.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <FiUsers className="text-5xl text-gray-400 mx-auto mb-3" />
                    <p>
                      {userRole === 'teacher'
                        ? 'No students assigned yet'
                        : 'No teacher assigned yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
