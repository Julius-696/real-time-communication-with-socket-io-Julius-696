import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI
      : 'mongodb://localhost:27017/chat-app';

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;