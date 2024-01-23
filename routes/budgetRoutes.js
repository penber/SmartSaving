import express from 'express';
import {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getExpensesByBudgetId
} from '../controllers/budgetController.js';
import { verifyToken, checkAuthorization } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @api {post} /budgets Create a new budget
 * @apiName CreateBudget
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiBody {Number} allocatedAmount Amount allocated for the budget
 * @apiBody {String} category Category of the budget
 * 
 * @apiSuccess {Object} budget Details of the created budget
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Route pour créer un budget
router.post('/', verifyToken, checkAuthorization,
createBudget);

/**
 * @api {get} /budgets Get all budgets
 * @apiName GetAllBudgets
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * 
 * @apiSuccess {Object[]} budgets List of all budgets
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Route pour obtenir tous les budgets
router.get('/', verifyToken, checkAuthorization, getAllBudgets);

/**
 * @api {get} /budgets/:id Get a specific budget
 * @apiName GetBudgetById
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the budget
 * 
 * @apiSuccess {Object} budget Details of the specific budget
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 */


// Route pour obtenir un budget spécifique
router.get('/:id', verifyToken, checkAuthorization, getBudgetById);

/**
 * @api {put} /budgets/:id Update a budget
 * @apiName UpdateBudget
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the budget to update
 * @apiBody {Number} [allocatedAmount] New allocated amount (optional)
 * @apiBody {String} [category] New category (optional)
 * 
 * @apiSuccess {Object} budget Updated budget details
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 */


// Route pour mettre à jour un budget
router.put('/:id', verifyToken, checkAuthorization, updateBudget);

/**
 * @api {delete} /budgets/:id Delete a budget
 * @apiName DeleteBudget
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the budget to delete
 * 
 * @apiSuccess {String} message Confirmation message
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 */


/**
 * @api {get} /expenses/by-budget/:budgetId Get all expenses associated with a budget
 * @apiName GetExpensesByBudgetId
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} budgetId Unique ID of the budget
 * 
 * @apiSuccess {Object[]} expenses List of all expenses associated with the budget
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 
 */
router.get('/by-budget/:budgetId', verifyToken, checkAuthorization, getExpensesByBudgetId);


/**
 * @api {delete} /budgets/:id Delete a budget
 * @apiName DeleteBudget
 * @apiGroup BudgetRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the budget to delete
 * 
 * @apiSuccess {String} message Confirmation message
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 * 
 * @apiError (401 Unauthorized) Unauthorized Error message
 */
// Route pour supprimer un budget
router.delete('/:id', verifyToken, checkAuthorization, deleteBudget);

export default router;