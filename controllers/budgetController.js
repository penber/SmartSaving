import Budget from '../models/Budget.js';
import { sendMessageToClient } from '../utils/ws.js';


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

     sendMessageToClient("", { event: 'budgetCreated', budget: savedBudget });

    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Fonction pour obtenir tous les budgets
export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


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

  
    sendMessageToClient('', { event: 'budget mise à jour', budget: budget });

    res.status(200).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  };

};


// Fonction pour supprimer un budget
export const deleteBudget = async (req, res) => {
  try {

    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });
    //web socket
    sendMessageToClient("", { event: 'budget éffacé', budgetId: req.params.id  });

    res.status(200).json({ message: 'Budget supprimé' });
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
