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
    socket.connect();
    socket.emit('join', { username: user.username });

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('newMessage');
      socket.off('onlineUsers');
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    socket.emit('sendMessage', { content: text });
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
              <li key={u.socketId}>{u.username}</li>
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
                <span>{msg.sender?.username}</span>
                <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
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