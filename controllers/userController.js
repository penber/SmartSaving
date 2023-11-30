import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Remplacez bcrypt par bcryptjs
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

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

  const user = new User({
    email,
    password: hashedPassword,
  });

  await user.save();
  
  // Création du token JWT
  const payload = {  id: user.id };
  const jwtSecret = process.env.JWT_SECRET || 'mySuperSecret';
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

  // Envoyer la réponse avec le token
  res.status(201).json({ message: 'Utilisateur créé', token });
};

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
