import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const login = async (req, res) => {
  try {
    const { username } = req.body;
    console.log('Login attempt for username:', username);

    if (!username || username.trim().length < 3) {
      console.log('Login failed: Invalid username');
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    let user = await User.findOne({ username });
    if (!user) {
      console.log('Creating new user:', username);
      user = await User.create({ username });
    }

    const token = jwt.sign(
      { id: user._id, username }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('Login successful for:', username);
    res.json({ 
      token, 
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};