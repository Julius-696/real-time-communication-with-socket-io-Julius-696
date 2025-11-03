import React, { useEffect, useState, useRef } from 'react';
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
    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
      socket.emit('join', { username: user.username });
    }

    // Listen for messages and users
    socket.on('newMessage', (message) => {
      console.log('Message received:', message);
      setMessages(prev => [...prev, message]);
    });

    socket.on('onlineUsers', (users) => {
      console.log('Online users updated:', users);
      setOnlineUsers(users);
    });

    // Fetch existing messages
    fetchMessages();

    return () => {
      socket.off('newMessage');
      socket.off('onlineUsers');
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages?room=global`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    
    console.log('Sending message:', text);
    socket.emit('sendMessage', {
      content: text,
      room: 'global'
    });
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
            {onlineUsers.map((onlineUser) => (
              <li key={onlineUser.socketId}>
                {onlineUser.username}
                {onlineUser.socketId === socket.id && ' (You)'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg, index) => (
            <div 
              key={msg._id || index}
              className={`message ${msg.sender?.username === user?.username ? 'my-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="username">{msg.sender?.username || 'Unknown'}</span>
                <span className="time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}