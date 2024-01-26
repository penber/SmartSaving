import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    allocatedAmount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    //couleur hexa 
    color: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', BudgetSchema);

export default Budget;
