import mongoose from 'mongoose';

const Users = new mongoose.Schema({
    username: {
        type: String,     
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }},
    {
        timestamps: true,
      }
);

export default mongoose.model('User', Users);
