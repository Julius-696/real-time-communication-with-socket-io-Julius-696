import User from '../models/userModel.js';
import Message from '../models/messageModel.js';

export default function socketHandler(io) {
  const onlineUsers = new Map();

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async ({ username }) => {
      try {
        // Remove any existing socket for this username
        for (const [socketId, existingUsername] of onlineUsers.entries()) {
          if (existingUsername === username) {
            onlineUsers.delete(socketId);
          }
        }

        // Add new socket connection
        onlineUsers.set(socket.id, username);
        
        let user = await User.findOne({ username });
        if (!user) {
          user = await User.create({ username });
        }

        user.socketId = socket.id;
        user.online = true;
        await user.save();

        // Emit updated online users list
        const onlineUsersList = Array.from(onlineUsers.entries()).map(([id, name]) => ({
          socketId: id,
          username: name
        }));

        io.emit('onlineUsers', onlineUsersList);
        console.log('Current online users:', onlineUsersList);

      } catch (error) {
        console.error('Join error:', error);
      }
    });

    socket.on('sendMessage', async (data) => {
      try {
        const username = onlineUsers.get(socket.id);
        const user = await User.findOne({ username });

        if (!user) {
          console.error('User not found for message');
          return;
        }

        const message = await Message.create({
          content: data.content,
          sender: user._id
        });

        const populatedMessage = {
          _id: message._id,
          content: message.content,
          sender: {
            _id: user._id,
            username: user.username
          },
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
        onlineUsers.delete(socket.id);
        const user = await User.findOne({ username });
        if (user) {
          user.online = false;
          user.lastSeen = new Date();
          await user.save();
        }

        // Emit updated online users list
        const onlineUsersList = Array.from(onlineUsers.entries()).map(([id, name]) => ({
          socketId: id,
          username: name
        }));

        io.emit('onlineUsers', onlineUsersList);
        console.log('User disconnected:', username);
        console.log('Remaining online users:', onlineUsersList);
      }
    });
  });
}