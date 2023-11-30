import express from 'express';
import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget
} from '../controllers/budgetController.js';
import { verifyToken, checkAuthorization } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour créer un budget
router.post('/', verifyToken, checkAuthorization,
createBudget);

// Route pour obtenir tous les budgets
router.get('/', verifyToken, checkAuthorization, getAllBudgets);

// Route pour obtenir un budget spécifique
router.get('/:id', verifyToken, checkAuthorization, getBudgetById);

// Route pour mettre à jour un budget
router.put('/:id', verifyToken, checkAuthorization, updateBudget);

// Route pour supprimer un budget
router.delete('/:id', verifyToken, checkAuthorization, deleteBudget);

export default router;
