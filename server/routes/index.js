import express from 'express';
import { protect } from '../middleware/auth.js';
import { login } from '../controllers/authController.js';
import { searchMessages, getMessages } from '../controllers/messageController.js';
import { upload, uploadFile } from '../controllers/uploadController.js';
import { getUserNotifications, markNotificationRead } from '../controllers/notificationController.js';

const router = express.Router();

// Auth routes
router.post('/auth/login', login);

// Message routes
router.get('/messages', protect, getMessages);
router.get('/messages/search', protect, searchMessages);

// Upload routes
router.post('/upload', protect, upload.single('file'), uploadFile);

// Notification routes
router.get('/notifications', protect, getUserNotifications);
router.put('/notifications/:id', protect, markNotificationRead);

export default router;