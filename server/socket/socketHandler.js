import User from '../models/userModel.js';
import Message from '../models/messageModel.js';

export default function socketHandler(io) {
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async ({ username }) => {
      try {
        console.log('User joining:', username);
        let user = await User.findOne({ username });
        
        if (!user) {
          user = await User.create({ username, socketId: socket.id });
        }

        user.socketId = socket.id;
        user.online = true;
        await user.save();

        onlineUsers.set(socket.id, username);
        
        // Broadcast updated online users list
        io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, name]) => ({
          socketId: id,
          username: name
        })));

        console.log('User joined successfully:', username);
      } catch (error) {
        console.error('Join error:', error);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        console.log('Received message:', data);
        const username = onlineUsers.get(socket.id);
        const user = await User.findOne({ username });

        if (!user) {
          console.error('User not found for message');
          return;
        }

        const message = await Message.create({
          content: data.content,
          sender: user._id,
          room: data.room || 'global'
        });

        const populatedMessage = {
          _id: message._id,
          content: message.content,
          sender: {
            _id: user._id,
            username: user.username
          },
          room: message.room,
          createdAt: message.createdAt
        };

        io.emit('newMessage', populatedMessage);
        console.log('Message sent:', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
      }
    });

    socket.on('disconnect', async () => {
      const username = onlineUsers.get(socket.id);
      if (username) {
        const user = await User.findOne({ username });
        if (user) {
          user.online = false;
          user.lastSeen = new Date();
          await user.save();
        }
        onlineUsers.delete(socket.id);
        io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, name]) => ({
          socketId: id,
          username: name
        })));
      }
      console.log('User disconnected:', socket.id);
    });
  });
}