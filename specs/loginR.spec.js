import supertest from "supertest";
import app from "../app.js"; 
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import User from '../models/User.js'; // Assurez-vous d'importer User
import { jest } from '@jest/globals';
   let token;
    let user;

describe('POST /api/users', function () {
 
    
    // Créer un utilisateur et obtenir un token avant de tester la création de budget
    
    it('should create a new user with correct information', async () => {
        //vérifier que l'utilisateur n'existe pas déjà
        const userExists = await User.findOne({ email: 'test2@gmail.com' });
        if (userExists) {
            await User.deleteOne({ email: 'test2@gmail.com' });
        }

        // Enregistrer un utilisateur et obtenir un token
        const userRes = await supertest(app)
        .post('/api/users/register') // Assurez-vous que c'est le bon chemin
        .send({
            email: 'test2@gmail.com',
            password: 'testpassword',
        });
    
        expect(userRes.statusCode).toEqual(201);
        expect(userRes.body).toHaveProperty('token');
        token = userRes.body.token;
        user = await User.findOne({ email: 'test2@gmail.com' });
      
    });

    it('should return 400 if required fields are missing or invalid', async () => {
        const res = await supertest(app)
          .post('/api/users/register')
          .send({
            email: '', // Email vide ou format invalide
            password: 'short' // Mot de passe trop court
          })
          .expect(400);
      
        expect(res.body).toHaveProperty('errors');
      });

      
      it('should return 400 if the email is already registered', async () => {
        // Assurez-vous que l'email est déjà enregistré dans la base de données
        const res = await supertest(app)
          .post('/api/users/register')
          .send({
            email: 'test2@gmail.com',
            password: 'testpassword'
          })
          .expect(400);
      
        expect(res.text).toEqual('Email déjà enregistré');
      });
      


    it('should log in an existing user and return a token', async () => {
        const loginData = {
            email: 'test2@gmail.com',
            password: 'testpassword'
        };

        const res = await supertest(app)
            .post('/api/users/login')
            .send(loginData)
            .expect(200); // S'attendre à un succès

        expect(res.body).toHaveProperty('token');
        const token = res.body.token;
    });


    it('should return 400 if the email does not exist', async () => {
        const res = await supertest(app)
          .post('/api/users/login')
          .send({
            email: 'nonexistentemail@gmail.com',
            password: 'validPassword'
          })
          .expect(400);
      
        expect(res.text).toEqual('Utilisateur non trouvé');
      });
      

      it('should return 400 for incorrect password', async () => {
        // Assurez-vous que l'email est correct et existe dans la base de données
        const res = await supertest(app)
          .post('/api/users/login')
          .send({
            email: 'test2@gmail.com',
            password: 'wrongPassword'
          })
          .expect(400);
      
        expect(res.text).toEqual('Mot de passe incorrect');
      });
      

    it('retrouver un profile avec lid', async () => {
        const res = await supertest(app)
          .get(`/api/users/${user._id}`) // Assurez-vous que c'est le bon chemin
          .set('Authorization', `Bearer ${token}`) // Utiliser le token
          .expect(200); // S'attendre à un succès
      
        expect(res.body).toHaveProperty('_id', user._id.toString());
        expect(res.body).toHaveProperty('email', user.email);
      });

      it('retourne une erreur 404 si utilisateur exite pas', async () => {
        const fakeUserId = new mongoose.Types.ObjectId(); // Créez un ID factice qui n'existe pas dans la base de données
        const res = await supertest(app)
          .get(`/api/users/${fakeUserId}`)
          .set('Authorization', `Bearer ${token}`) // Utiliser un token valide
          .expect(404);
      
        expect(res.text).toEqual('Utilisateur non trouvé');
      });

      it('should return 401 if no token is provided', async () => {
        const res = await supertest(app)
          .get(`/api/users/${user._id}`)
          .expect(401);
      
        // Le message exact dépend de votre implémentation du middleware `verifyToken`
        expect(res.text).toContain('Accès refusé');
      });
      

      
       it('should update the user profile', async () => {
         const updatedData = {
           password: 'updatedpassword',
           email: 'updatedemail@gmail.com'
         };
        const res = await supertest(app)
           .put(`/api/users/${user._id}`) // Assurez-vous que c'est le bon chemin
           .set('Authorization', `Bearer ${token}`) // Utiliser le token
           .send(updatedData)
           .expect(200); // S'attendre à un succès
            
         // Vérifier que les données de l'utilisateur ont été mises à jour
         const updatedUser = await User.findById(user._id);
         expect(updatedUser).toHaveProperty('password', updatedData.password);
         expect(updatedUser).toHaveProperty('email', updatedData.email);

       });

       it('should return 400 if required data is missing', async () => {
        const incompleteData = {
       };
        const res = await supertest(app)
          .put(`/api/users/${user._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(incompleteData)
          .expect(400);
      
        expect(res.text).toEqual('Email et mot de passe manquant');
      });
    

      it('Test des middleware sur une page inexistante', async () => {
        const res = await supertest(app)
          .get('/route-qui-nexiste-pas')
          .expect(404);
      
        expect(res.text).toEqual('Page non trouvée');
      });
      
      

    afterAll(async () => {
        await User.deleteOne({ _id: user._id });
        await mongoose.disconnect();

    });
});
