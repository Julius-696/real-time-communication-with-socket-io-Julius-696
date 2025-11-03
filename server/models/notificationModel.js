import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'mention', 'reaction', 'join'],
    required: true
  },
  content: String,
  read: {
    type: Boolean,
    default: false
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Message', 'User']
  }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);