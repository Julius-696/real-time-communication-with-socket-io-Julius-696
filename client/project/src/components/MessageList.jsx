import React from 'react';

export default function MessageList({ messages, me }) {
  return (
    <div className="messages">
      {messages.map(m => (
        <div key={m.id} className={`message ${m.from === me ? 'me' : ''} ${m.private ? 'private' : ''}`}>
          <div className="meta">
            <strong>{m.from}</strong>
            <span className="time">{new Date(m.timestamp).toLocaleTimeString()}</span>
            {m.private && <span className="badge">private</span>}
          </div>
          <div className="text">{m.text}</div>
        </div>
      ))}
    </div>
  );
}