import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageInput from './MessageInput';
import socket from '../socket/socketClient';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('join', { username: user.username });
    }

    socket.on('newMessage', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('newMessage');
      socket.off('onlineUsers');
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!content.trim()) return;
    
    // Create a temporary message object for immediate display
    const tempMessage = {
      _id: Date.now(),
      content,
      sender: {
        username: user.username
      },
      createdAt: new Date()
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, tempMessage]);

    // Send to server
    socket.emit('sendMessage', { content });
  };

  return (
    <div className="chat-layout">
      <div className="sidebar">
        <div className="user-info">
          <h3>Welcome, {user?.username}</h3>
        </div>
        <div className="online-users">
          <h4>Online Users ({onlineUsers.length})</h4>
          <ul>
            {onlineUsers.map(u => (
              <li key={u.socketId}>{u.username} {u.username === user.username && '(You)'}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg, index) => (
            <div 
              key={msg._id || index}
              className={`message ${msg.sender.username === user.username ? 'my-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="username">{msg.sender.username}</span>
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}