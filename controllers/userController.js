import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Remplacez bcrypt par bcryptjs
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @api {post} /register Register a new user
 * @apiName RegisterUser
 * @apiGroup User
 * 
 * @apiBody {String} email Email of the user
 * @apiBody {String} password Password of the user
 * @apiBody {String} [username] Username of the user (optional)
 * 
 * @apiSuccess {String} message Success message
 * @apiSuccess {String} token JWT token for the user
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "Utilisateur créé",
 *       "token": "jwt.token.here"
 *     }
 * 
 * @apiError (400 Bad Request) BadRequest Email déjà enregistré / Validation error
 */


export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).send('Email déjà enregistré');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let user;
  if(req.body.username){
    const { username } = req.body;
    user = new User({
      email,
      password: hashedPassword,
      username
    });
  } else {
    user = new User({
      email,
      password: hashedPassword,
    });
  }


  await user.save();
  
  // Création du token JWT
  const payload = {  id: user.id };
  const jwtSecret = process.env.JWT_SECRET || 'mySuperSecret';
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '111d' });

  // Envoyer la réponse avec le token
  res.status(201).json({ message: 'Utilisateur créé', token });
};


/**
 * @api {post} /login Login a user
 * @apiName LoginUser
 * @apiGroup User
 * 
 * @apiBody {String} email Email of the user
 * @apiBody {String} password Password of the user
 * 
 * @apiSuccess {String} token JWT token for the user
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "jwt.token.here"
 *     }
 * 
 * @apiError (400 Bad Request) BadRequest Utilisateur non trouvé / Mot de passe incorrect
 */


export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send('Utilisateur non trouvé');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).send('Mot de passe incorrect');
  }

  // Générez le SECRET_KEY avec jwt
  const SECRET_KEY = process.env.JWT_SECRET; // Utilisez la clé secrète à partir de .env
  const token = jwt.sign({ id: user._id }, SECRET_KEY, {
    expiresIn: '1000d',
  });

 
  res.status(200).json({ token });
};


/**
 * @api {post} /logout Logout a user
 * @apiName LogoutUser
 * @apiGroup User
 * 
 * @apiSuccess {String} message Logout confirmation message
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Déconnecté"
 *     }
 */


export const logout = (req, res) => {

  res.status(200).send('Déconnecté');
};

export const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send('Utilisateur non trouvé');
  }

  res.status(200).json(user);
};


/**
 * @api {put} /user/:id Update user profile
 * @apiName UpdateUserProfile
 * @apiGroup User
 * 
 * @apiParam {String} id Unique ID of the user
 * @apiBody {String} [password] New password of the user
 * @apiBody {String} [email] New email of the user
 * 
 * @apiSuccess {Object} user Updated user profile data
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       ...updated user data...
 *     }
 * 
 * @apiError (400 Bad Request) BadRequest Email et mot de passe manquant
 * @apiError (404 Not Found) NotFound Utilisateur non trouvé
 */


export const updateUserProfile = async (req, res) => {
  const userId = req.userId;

  let password = req.body.password;
  let email = req.body.email;
  if(!password && !email){
  return res.status(400).send('Email et mot de passe manquant');}
  
  if(!userId){
    return res.status(404).send('Utilisateur non trouvé');
  }
  await User.findByIdAndUpdate(userId, { password, email });
  //chercher le user modifié et mettre à jour le token
//gerer lerreur si le user nexiste pas

  const newuser = await User.findById(userId);

  console.log(newuser);
  res.status(200).send(newuser);
};
