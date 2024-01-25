import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { StatusCodes } from 'http-status-codes';
import { sendMessageToClient } from '../utils/ws.js';


/**
 * @api {post} /expenses Ajouter une dépense
 * @apiName AddExpense
 * @apiGroup Expense
 * 
 * @apiBody {Number} amount Montant de la dépense
 * @apiBody {String} description Description de la dépense
 * @apiBody {Date} date Date de la dépense
 * @apiBody {String} budgetId ID du budget associé
 * 
 * @apiSuccess {Object} expense Détails de la dépense créée
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "user": "652efb3d8ff75cc65d837096",
 *       "amount": 20,
 *       "description": "Macdo",
 *       "date": "2023-11-21T00:00:00.000Z",
 *       "budget": "655d0b6f86a78aa02906d164",
 *       "_id": "655d0f04aa5c69420dc185ef",
 *       "createdAt": "2023-11-21T20:11:48.992Z",
 *       "updatedAt": "2023-11-21T20:11:48.992Z",
 *       "__v": 0
 *     }
 * 
 * @apiError (400 Bad Request) BadRequest Information manquante ou invalide
 * @apiError (404 Not Found) NotFound Budget non trouvé
 */


export const addExpense = async (req, res) => {
  const { amount, description, date, budgetId, location } = req.body;

  // Validation des entrées
  if (!amount || !description || !date) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Les informations fournies sont incomplètes." });
  }

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
    const expenseData = { amount, description, date, user: req.userId, budget: budgetId };

    if (location) {
      expenseData.location = location;
    }

    const newExpense = new Expense(expenseData);
    const savedExpense = await newExpense.save();

    // Web socket: Envoyer un message si nécessaire
    sendMessageToClient(req.userId, { event: 'dépense ajoutée', expense: savedExpense });

    res.status(StatusCodes.CREATED).json(savedExpense);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};




/**
 * @api {get} /expenses Obtenir toutes les dépenses
 * @apiName GetAllExpenses
 * @apiGroup Expense
 * 
 * @apiSuccess {Object[]} expenses Liste des dépenses
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       // ...liste des dépenses
 *     ]
 * 
 * @apiError (400 Bad Request) BadRequest Erreur lors de la récupération des données
 */



// Fonction pour obtenir toutes les dépenses
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * @api {get} /expenses/:id Obtenir une dépense spécifique
 * @apiName GetExpenseById
 * @apiGroup Expense
 * 
 * @apiParam {String} id ID unique de la dépense
 * 
 * @apiSuccess {Object} expense Détails de la dépense spécifique
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       // ...détails de la dépense
 *     }
 * 
 * @apiError (404 Not Found) NotFound Dépense non trouvée
 */


export const getExpenseById = async (req, res) => {
  try {  
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId }).populate('budget');
    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });
    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * @api {put} /expenses/:id Update an expense
 * @apiName UpdateExpense
 * @apiGroup Expense
 * 
 * @apiParam {String} id ID of the expense to update
 * @apiBody {Number} amount New amount
 * @apiBody {String} description New description
 * @apiBody {Date} date New date
 * @apiBody {String} [budgetId] New associated budget ID (optional)
 * 
 * @apiSuccess {Object} expense Updated expense details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       ... // Updated expense details
 *     }
 * 
 * @apiError (404 Not Found) NotFound Expense not found
 */




// Fonction pour mettre à jour une dépense
export const updateExpense = async (req, res) => {
  try {
    const { amount, description, date, budgetId, location } = req.body;
    const updateData = { amount, description, date };

    // Ajouter budgetId si fourni
    if (budgetId) {
      updateData.budget = budgetId;
    }

    // Ajouter location si fournie
    if (location) {
      updateData.location = location;
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    sendMessageToClient(req.userId, { event: 'depensemsj', expense: expense });
    res.status(200).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



/**
 * @api {delete} /expenses/:id Delete an expense
 * @apiName DeleteExpense
 * @apiGroup Expense
 * 
 * @apiParam {String} id Unique ID of the expense to delete
 * 
 * @apiSuccess {String} message Message confirming the deletion
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Dépense supprimée"
 *     }
 * 
 * @apiError (404 Not Found) NotFound Expense not found
 * @apiError (400 Bad Request) BadRequest Error message
 */



// Fonction pour supprimer une dépense
export const deleteExpense = async (req, res) => {
  try {
    console.log("expense delete");

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
console.log(expense);

    if (!expense) return res.status(404).json({ message: 'Dépense non trouvée' });

    res.status(200).json({ message: 'Dépense supprimée' });

    sendMessageToClient(req.userId, { event: 'depensesup', expenseId: req.params.id });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @api {get} /expenses/by-budget/:budgetName Get expenses by budget name
 * @apiName GetExpensesByBudget
 * @apiGroup Expense
 * 
 * @apiParam {String} budgetName Name of the budget
 * 
 * @apiSuccess {Object[]} expenses List of expenses for the specified budget
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [ ... Array of expenses objects ... ]
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 * @apiError (500 Internal Server Error) InternalServerError Error message
 */


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

/**
 * @api {get} /expenses/filtrer Filter expenses
 * @apiName FilterExpenses
 * @apiGroup Expense
 * 
 * @apiQuery {String} [category] Category to filter by
 * @apiQuery {Date} [date] Date to filter by
 * 
 * @apiSuccess {Object[]} expenses List of filtered expenses
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [ ... Array of filtered expenses objects ... ]
 * 
 * @apiError (500 Internal Server Error) InternalServerError Error message
 */


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



