import Message from '../models/messageModel.js';

export const searchMessages = async (req, res) => {
  try {
    const { query, room } = req.query;
    const messages = await Message.find({
      room,
      content: { $regex: query, $options: 'i' }
    })
    .populate('sender', 'username')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { room, before, limit = 50 } = req.query;
    const query = { room };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};