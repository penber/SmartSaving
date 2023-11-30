import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { StatusCodes } from 'http-status-codes';
import { sendMessageToClient } from '../utils/ws.js';

export const addExpense = async (req, res) => {
  const { amount, description, date, budgetId } = req.body;

  // Validation des entrées
  if (!amount || !description || !date) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Les informations fournies sont incomplètes." });
  }

  // Valider l'existence du budget et qu'il appartient à l'utilisateur
  if (budgetId) {
    let budget;
    try {
      budget = await Budget.findById(budgetId);
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "L'ID du budget est invalide." });
    }
    if (!budget) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Budget non trouvé." });
    }
    if (budget.user.toString() !== req.userId) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Le budget n'appartient pas à l'utilisateur." });
    }
  }

  try {
    const newExpense = new Expense({ amount, description, date, user: req.userId, budget: budgetId });
    const savedExpense = await newExpense.save();
    //web socket 
    // sendMessageToClient(clientId, { event: 'dépense ajputé', expense: savedExpense  });

    res.status(StatusCodes.CREATED).json(savedExpense);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};


// Fonction pour obtenir toutes les dépenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {  
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId }).populate('budget');
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });
    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fonction pour mettre à jour une dépense
export const updateExpense = async (req, res) => {
  try {

    let expense;

    const { amount, description, date, budgetId  } = req.body;

    if(!budgetId) {
       expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { amount, description, date },
        { new: true }
      );
    } else {
      expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        { amount, description, date,budget: budgetId },
        { new: true }
      );
    }
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });



    sendMessageToClient("", { event: 'depensemsj', expense: expense });


    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fonction pour supprimer une dépense
export const deleteExpense = async (req, res) => {
  try {
    console.log("expense delete");

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
console.log(expense);

    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });

    res.status(200).json({ message: 'Dépense supprimée' });

    // sendMessageToClient("", { event: 'depensesup', expenseId: req.params.id });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpensesByBudgetId = async (req, res) => {
  try {
    const budgetName = req.params.budgetName;
    
    const budget = await Budget.findOne({ category: budgetName, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'No budget found with this name.' });

    const expenses = await Expense.find({ budget: budget._id, user: req.userId });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const filtreexpenses = async (req, res) => {
  try {
      const { category, date } = req.query;

      let dateFilter = {};
      
      if (date) {
          const startDate = new Date(date);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          dateFilter = { date: { $gte: startDate } };
      }

      let expenseFilter = { ...dateFilter };
      if (category) {
          const budgetIds = await Budget.find({ category }).distinct('_id');
          if (budgetIds.length > 0) {
              expenseFilter.budget = { $in: budgetIds };
          } else {
              // Si aucun budget correspondant n'est trouvé, renvoyer une réponse vide
              return res.json([]);
          }
      }
      const expenses = await Expense.find(expenseFilter).populate('budget');
      res.json(expenses);
  } catch (error) {
      res.status(500).send(error.message);
  }
};



