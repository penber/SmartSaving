import express from 'express';
import {
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile,
  deleteUser
} from '../controllers/userController.js';

import {
  verifyToken,
  checkAuthorization
} from '../middleware/authMiddleware.js';

import { check, validationResult } from 'express-validator';
import { notFound, errorHandler } from '../middleware/errorMiddleware.js';


const router = express.Router();

/**
 * @api {post} /users/register Register a new user
 * @apiName RegisterUser
 * @apiGroup UserRoute
 * 
 * @apiBody {String} email Email of the user
 * @apiBody {String} password Password of the user
 * 
 * @apiSuccess {String} message Success message
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */



router.post('/register', [

  check('email').isEmail().withMessage('Email invalide'),
  // Le mot de passe doit comporter au moins 5 caractères
  check('password').isLength({ min: 5 }).withMessage('Le mot de passe doit comporter au moins 5 caractères')
 ], register);


 /**
 * @api {post} /users/login Login a user
 * @apiName LoginUser
 * @apiGroup UserRoute
 * 
 * @apiBody {String} email Email of the user
 * @apiBody {String} password Password of the user
 * 
 * @apiSuccess {String} token Auth token for the user
 * 
 * @apiError (400 Bad Request) BadRequest Error message
 */



router.post('/login', login);



/**
 * @api {post} /users/logout Logout a user
 * @apiName LogoutUser
 * @apiGroup UserRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * 
 * @apiSuccess {String} message Success message
 */



router.post('/logout', verifyToken, logout);


/**
 * @api {get} /users/:id Get user profile
 * @apiName GetUserProfile
 * @apiGroup UserRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id User's unique ID
 * 
 * @apiSuccess {Object} userProfile User's profile data
 * 
 * @apiError (404 Not Found) UserNotFound No user found with the given ID
 */


// Route pour obtenir le profil de l'utilisateur
router.get('/:id', verifyToken, getUserProfile);


/**
 * @api {put} /users/:id Update user profile
 * @apiName UpdateUserProfile
 * @apiGroup UserRoute
 * 
 * @apiHeader {String} Authorization User's auth token
 * @apiParam {String} id User's unique ID
 * @apiBody {String} [email] Email of the user (optional)
 * @apiBody {String} [password] New password of the user (optional)
 * 
 * @apiSuccess {Object} userProfile Updated user's profile data
 * 
 * @apiError (404 Not Found) UserNotFound No user found with the given ID
 * @apiError (400 Bad Request) BadRequest Error message
 */


// mettre à jour le profil de l'utilisateur
router.put('/:id', verifyToken, updateUserProfile);

//supprimer un utilisateur

router.delete('/:id', verifyToken, deleteUser);

// Middleware pour gérer les erreurs
router.use(notFound);
router.use(errorHandler);

export default router;