import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body);

    if (!req.body || !req.body.username) {
      return res.status(400).json({ 
        message: 'Username is required' 
      });
    }

    const { username } = req.body;

    if (!username.trim()) {
      return res.status(400).json({ 
        message: 'Username cannot be empty' 
      });
    }

    let user = await User.findOne({ username });
    if (!user) {
      user = await User.create({ username });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login' 
    });
  }
};