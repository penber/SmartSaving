import mongoose from 'mongoose';

export const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((error) => console.log(`Database connection error: ${error}`));
};


