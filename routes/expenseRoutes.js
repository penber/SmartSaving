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

/**
 * @api {post} /expenses Add an expense
 * @apiName AddExpense
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiBody {Number} amount Amount of the expense
 * @apiBody {String} description Description of the expense
 * @apiBody {Date} date Date of the expense
 * @apiBody {String} [budgetId] ID of the associated budget (optional)
 * 
 * @apiSuccess {Object} expense Details of the added expense
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Route pour ajouter une dépense
router.post('/', verifyToken, checkAuthorization, addExpense);


/**
 * @api {get} /expenses Get all expenses
 * @apiName GetAllExpenses
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * 
 * @apiSuccess {Object[]} expenses List of all expenses
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Route pour obtenir toutes les dépenses
router.get('/', verifyToken, checkAuthorization, getAllExpenses);

/**
 * @api {get} /expenses/:id Get a specific expense
 * @apiName GetExpenseById
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the expense
 * 
 * @apiSuccess {Object} expense Details of the specific expense
 * 
 * @apiError (404 Not Found) NotFound Expense not found
 */


// Route pour obtenir une dépense spécifique
router.get('/:id', verifyToken, checkAuthorization, getExpenseById);


/**
 * @api {put} /expenses/:id Update an expense
 * @apiName UpdateExpense
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the expense to update
 * @apiBody {Number} [amount] New amount (optional)
 * @apiBody {String} [description] New description (optional)
 * @apiBody {Date} [date] New date (optional)
 * @apiBody {String} [budgetId] New associated budget ID (optional)
 * 
 * @apiSuccess {Object} expense Updated expense details
 * 
 * @apiError (404 Not Found) NotFound Expense not found
 */


// Route pour mettre à jour une dépense
router.put('/:id', verifyToken, checkAuthorization, updateExpense);


/**
 * @api {delete} /expenses/:id Delete an expense
 * @apiName DeleteExpense
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id Unique ID of the expense to delete
 * 
 * @apiSuccess {String} message Confirmation message
 * 
 * @apiError (404 Not Found) NotFound Expense not found
 */


// Route pour supprimer une dépense
router.delete('/:id', verifyToken, checkAuthorization, deleteExpense);

/**
 * @api {get} /expenses/filtrer/par Filter expenses
 * @apiName FilterExpenses
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiQuery {String} [category] Category to filter by
 * @apiQuery {Date} [date] Date to filter by
 * 
 * @apiSuccess {Object[]} expenses List of filtered expenses
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


router.get('/filtrer/par', verifyToken, checkAuthorization, filtreexpenses);



/**
 * @api {get} /expenses/by-budget/:budgetName Get expenses by budget name
 * @apiName GetExpensesByBudgetName
 * @apiGroup ExpenseRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} budgetName Name of the budget
 * 
 * @apiSuccess {Object[]} expenses List of expenses associated with the specified budget
 * 
 * @apiError (404 Not Found) NotFound No expenses found for the given budget
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Route pour obtenir toutes les dépenses associées à un budget 
router.get('/by-budget/:budgetName', verifyToken, checkAuthorization, getExpensesByBudgetId);

export default router;