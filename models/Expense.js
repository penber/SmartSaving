import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    // ... autres propriétés existantes ...
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: false,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
  },
  {
    timestamps: true,
  }
);

// Créer un index géospatial pour 'location.coordinates'
ExpenseSchema.index({ 'location.coordinates': '2dsphere' });

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;
