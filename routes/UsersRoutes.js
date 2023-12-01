import express from 'express';
import {
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController.js';

import {
  verifyToken,
  checkAuthorization
} from '../middleware/authMiddleware.js';

import { check, validationResult } from 'express-validator';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';


const router = express.Router();


router.post('/register', [

  check('email').isEmail().withMessage('Email invalide'),
  // Le mot de passe doit comporter au moins 5 caractères
  check('password').isLength({ min: 5 }).withMessage('Le mot de passe doit comporter au moins 5 caractères')
 ], register);


 


router.post('/login', login);



router.post('/logout', verifyToken, logout);




// Route pour obtenir le profil de l'utilisateur
router.get('/:id', verifyToken, getUserProfile);




// mettre à jour le profil de l'utilisateur
router.put('/:id', verifyToken, updateUserProfile);

// Middleware pour gérer les erreurs
router.use(notFound);
router.use(errorHandler);

export default router;