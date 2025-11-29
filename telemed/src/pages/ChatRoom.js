import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Search,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatService, userService } from '../utils/firestoreUtils';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ChatRoom = () => {
  const { userData, currentUser } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (currentUser && userData) {
      fetchChatRooms();
      fetchAvailableUsers();
    }
  }, [currentUser, userData]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      // Set up real-time listener for messages
      const unsubscribe = chatService.listenToMessages(selectedChat.id, (newMessages) => {
        setMessages(newMessages);
        scrollToBottom();
      });
      return unsubscribe;
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getUserRooms(currentUser.uid);
      
      // Enhance room data with user info
      const enhancedRooms = await Promise.all(
        rooms.map(async (room) => {
          const otherUserId = room.participants.find(p => p !== currentUser.uid);
          const otherUser = await userService.getById(otherUserId);
          
          return {
            ...room,
            otherUser,
            displayName: otherUser?.displayName || 'Unknown User',
            lastSeen: otherUser?.lastSeen || null,
            isOnline: otherUser?.isOnline || false
          };
        })
      );
      
      setChatRooms(enhancedRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const userType = userData.userType === 'doctor' ? 'patient' : 'doctor';
      const users = await userService.search('', userType);
      setAvailableUsers(users.filter(user => user.id !== currentUser.uid));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    
    try {
      setMessagesLoading(true);
      // Messages will be loaded via the real-time listener
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const messageData = {
        senderId: currentUser.uid,
        senderName: userData.displayName,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      await chatService.sendMessage(selectedChat.id, messageData);
      setNewMessage('');
      messageInputRef.current?.focus();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCreateNewChat = async (userId) => {
    try {
      const roomId = await chatService.createOrGetRoom([currentUser.uid, userId]);
      const otherUser = await userService.getById(userId);
      
      const newRoom = {
        id: roomId,
        participants: [currentUser.uid, userId],
        otherUser,
        displayName: otherUser?.displayName || 'Unknown User',
        lastMessage: null,
        lastActivity: new Date().toISOString(),
        isOnline: otherUser?.isOnline || false
      };
      
      setSelectedChat(newRoom);
      setShowNewChatModal(false);
      await fetchChatRooms();
      
      toast.success(`Started conversation with ${otherUser?.displayName}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredChatRooms = chatRooms.filter(room =>
    room.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner size="large" message="Loading conversations..." />
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p>Secure communication with {userData?.userType === 'doctor' ? 'patients' : 'healthcare providers'}</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowNewChatModal(true)}
        >
          <Plus size={20} />
          New Chat
        </Button>
      </div>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="chat-list">
            {filteredChatRooms.length > 0 ? (
              filteredChatRooms.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-avatar">
                    <div className="avatar-circle">
                      {getInitials(chat.displayName)}
                    </div>
                    <div className={`status-indicator ${chat.isOnline ? 'online' : 'offline'}`}></div>
                  </div>
                  
                  <div className="chat-info">
                    <div className="chat-header">
                      <h4>{chat.displayName}</h4>
                      <span className="timestamp">
                        {formatMessageTime(chat.lastActivity)}
                      </span>
                    </div>
                    <p className="last-message">
                      {chat.lastMessage || 'Start a conversation...'}
                    </p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <div className="unread-badge">{chat.unreadCount}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h4>No conversations</h4>
                <p>Start a new conversation to begin messaging</p>
              </div>
            )}
          </div>
        </div>

        <div className="chat-main">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="patient-info">
                  <Button 
                    variant="outline" 
                    className="mobile-back-btn"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft size={20} />
                  </Button>
                  
                  <div className="avatar-circle">
                    {getInitials(selectedChat.displayName)}
                  </div>
                  
                  <div>
                    <h3>{selectedChat.displayName}</h3>
                    <p className={`status ${selectedChat.isOnline ? 'online' : 'offline'}`}>
                      {selectedChat.isOnline ? 'Online' : 
                       selectedChat.lastSeen ? `Last seen ${formatMessageTime(selectedChat.lastSeen)}` : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="chat-actions">
                  <Button variant="outline" size="small" title="Voice call">
                    <Phone size={18} />
                  </Button>
                  <Button variant="outline" size="small" title="Video call">
                    <Video size={18} />
                  </Button>
                  <Button variant="outline" size="small" title="More options">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>

              <div className="messages-container">
                {messagesLoading ? (
                  <div className="loading-messages">
                    <LoadingSpinner size="small" message="Loading messages..." />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <span className="message-time">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-messages">
                    <h4>No messages yet</h4>
                    <p>Send a message to start the conversation</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input-form" onSubmit={handleSendMessage}>
                <div className="input-container">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="small"
                    className="attachment-btn"
                    title="Attach file"
                  >
                    <Paperclip size={18} />
                  </Button>
                  
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="message-input"
                    disabled={sending}
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="small"
                    className="emoji-btn"
                    title="Add emoji"
                  >
                    <Smile size={18} />
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="send-button"
                    disabled={!newMessage.trim() || sending}
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <h3>No conversation selected</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowNewChatModal(true)}
                  style={{ marginTop: '1rem' }}
                >
                  <Plus size={18} />
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Conversation</h3>
              <Button variant="outline" onClick={() => setShowNewChatModal(false)}>
                ×
              </Button>
            </div>
            
            <div className="modal-body">
              <p>Select a {userData?.userType === 'doctor' ? 'patient' : 'doctor'} to start a conversation:</p>
              
              <div className="users-list">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="user-item"
                      onClick={() => handleCreateNewChat(user.id)}
                    >
                      <div className="avatar-circle">
                        {getInitials(user.displayName)}
                      </div>
                      <div className="user-info">
                        <h4>{user.displayName}</h4>
                        <p>{user.specialization || user.userType}</p>
                      </div>
                      <Button variant="outline" size="small">
                        Chat
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No {userData?.userType === 'doctor' ? 'patients' : 'doctors'} available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;