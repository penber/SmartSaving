import Budget from '../models/Budget.js';
import { sendMessageToClient } from '../utils/ws.js';
import Expense from '../models/Expense.js';



/**
 * @api {post} /budget Create a new budget
 * @apiName CreateBudget
 * @apiGroup Budget
 * 
 * @apiBody {Number} allocatedAmount Amount allocated for the budget
 * @apiBody {String} category Category of the budget
 * @apiBody {String} [user] User ID (optional, determined from token)
 * 
 * @apiSuccess {Object} budget Details of the created budget
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "user": "652efb3d8ff75cc65d837096",
 *       "allocatedAmount": 400,
 *       "category": "rien",
 *       "_id": "655d0b6f86a78aa02906d164",
 *       "createdAt": "2023-11-21T19:56:31.806Z",
 *       "updatedAt": "2023-11-21T19:56:31.806Z",
 *       "__v": 0
 *     }
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */


// Fonction pour créer un budget
export const createBudget = async (req, res) => {

  const { allocatedAmount, category, } = req.body; 
  let user ;
  //récupérer l'id de l'utilisateur de la requête si l'utilisateur est connecté
  if(req.userId) {user= req.userId;} 
  else if (req.body.id) 
  {user = req.body.id;};

  try {
    const newBudget = new Budget({
      allocatedAmount,
      category,
      user
    });

    const savedBudget = await newBudget.save();

     sendMessageToClient(req.userId, { event: 'budgetCreated', budget: savedBudget });

    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



/**
 * @api {get} /budgets Get all budgets
 * @apiName GetAllBudgets
 * @apiGroup Budget
 * 
 * @apiSuccess {Object[]} budgets List of budgets
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "user": "652efb3d8ff75cc65d837096",
 *         "allocatedAmount": 400,
 *         "category": "Vacation",
 *         "_id": "655d0b6f86a78aa02906d164",
 *         "createdAt": "2023-11-21T19:56:31.806Z",
 *         "updatedAt": "2023-11-21T19:56:31.806Z",
 *         "__v": 0
 *       },
 *       // ... other budgets
 *     ]
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */



// Fonction pour obtenir tous les budgets
export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



/**
 * @api {get} /budgets/:id Get a specific budget by ID
 * @apiName GetBudgetById
 * @apiGroup Budget
 * 
 * @apiParam {String} id Unique ID of the budget
 * 
 * @apiSuccess {Object} budget Details of the specific budget
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": "652efb3d8ff75cc65d837096",
 *       "allocatedAmount": 400,
 *       "category": "Vacation",
 *       "_id": "655d0b6f86a78aa02906d164",
 *       "createdAt": "2023-11-21T19:56:31.806Z",
 *       "updatedAt": "2023-11-21T19:56:31.806Z",
 *       "__v": 0
 *     }
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 */




// Fonction pour obtenir un budget spécifique par ID
export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });
    res.status(200).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


/**
 * @api {put} /budgets/:id Update a budget
 * @apiName UpdateBudget
 * @apiGroup Budget
 * 
 * @apiParam {String} id Unique ID of the budget to update
 * @apiBody {Number} allocatedAmount New allocated amount
 * @apiBody {String} category New category
 * 
 * @apiSuccess {Object} budget Updated budget details
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": "652efb3d8ff75cc65d837096",
 *       "allocatedAmount": 500,
 *       "
*/


// Fonction pour mettre à jour un budget
export const updateBudget = async (req, res) => {
  const { allocatedAmount, category} = req.body;

  //verifier si les champs sont remplis

  if (!allocatedAmount || !category) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs' });
  }
  try {
   
    let budget;
    let user ;
    if(req.userId) {user= req.userId;} 
    else {console.log("pas d'id")};


   try { 
     budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: user },
      { allocatedAmount, category },
      { new: true }
    ); } catch (error) {
        res.status(400).json({ message: error.message });

  }

    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });

  
    sendMessageToClient(req.userId, { event: 'budget mise à jour', budget: budget });

    res.status(200).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  };

};


export const getExpensesByBudgetId = async (req, res) => {
  try {
    const budgetId = req.params.budgetId;

    // Vérifier si le budget existe
    const budgetExists = await Budget.findById(budgetId);
    if (!budgetExists) {
      return res.status(404).json({ message: 'Budget non trouvé.' });
    }

    const expenses = await Expense.find({ budget: budgetId, user: req.userId });

    // Renvoyer un tableau vide si aucune dépense n'est trouvée
    if (!expenses.length) {
      return res.status(200).json([]);
    }

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


/**
 * @api {delete} /budgets/:id Delete a budget
 * @apiName DeleteBudget
 * @apiGroup Budget
 * 
 * @apiParam {String} id Unique ID of the budget to delete
 * 
 * @apiSuccess {String} message Confirmation message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Budget supprimé"
 *     }
 * 
 * @apiError (404 Not Found) NotFound Budget not found
 */



// Fonction pour supprimer un budget
export const deleteBudget = async (req, res) => {
  try {

    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });
    //web socket
    sendMessageToClient(req.userId, { event: 'budget éffacé', budgetId: req.params.id  });

    res.status(200).json({ message: 'Budget supprimé' });
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
