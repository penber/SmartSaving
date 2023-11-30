import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;
