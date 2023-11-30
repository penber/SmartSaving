import express from 'express';
import {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesByBudgetId,
  filtreexpenses
} from '../controllers/depenseController.js';
import { verifyToken, checkAuthorization } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour ajouter une dépense
router.post('/', verifyToken, checkAuthorization, addExpense);

// Route pour obtenir toutes les dépenses
router.get('/', verifyToken, checkAuthorization, getAllExpenses);

// Route pour obtenir une dépense spécifique
router.get('/:id', verifyToken, checkAuthorization, getExpenseById);

// Route pour mettre à jour une dépense
router.put('/:id', verifyToken, checkAuthorization, updateExpense);

// Route pour supprimer une dépense
router.delete('/:id', verifyToken, checkAuthorization, deleteExpense);

router.get('/filtrer/par', verifyToken, checkAuthorization, filtreexpenses);
// Route pour obtenir toutes les dépenses associées à un budget 
router.get('/by-budget/:budgetName', verifyToken, checkAuthorization, getExpensesByBudgetId);

export default router;
