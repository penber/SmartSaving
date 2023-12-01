import supertest from "supertest";
import app from "../app.js"; // Assurez-vous que le chemin est correct
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import User from '../models/User.js'; // Assurez-vous d'importer User
import { jest } from '@jest/globals';
import Expense from "../models/Expense.js";
import { StatusCodes } from "http-status-codes";

let token;
let user;
let expence_id;
let budget_id;

describe('Tests /api/expenses', function () {

    
    // Créer un utilisateur et obtenir un token avant de tester la création de budget
    beforeAll(async () => {

        //vérifier que l'utilisateur n'existe pas déjà
        const userExists = await User.findOne({ email: 'expense@gmail.com' });
        if (userExists) {
            await User.deleteOne({ email: 'expense@gmail.com' });
        }

        // Enregistrer un utilisateur et obtenir un token
        const userRes = await supertest(app)
        .post('/api/users/register') // Assurez-vous que c'est le bon chemin
        .send({
            email: 'expense@gmail.com',
            password: 'testpassword',
        });
    
        expect(userRes.statusCode).toEqual(201);
        expect(userRes.body).toHaveProperty('token');
        token = userRes.body.token;

        // Récupérer l'utilisateur créé
        user = await User.findOne({ email: 'expense@gmail.com' });
         });

         
    // Fonctionne
    it('should create a new expense with correct information', async () => {
        const expensesData = {
            amount : 240, 
            description : "nouvealle depense", 
            date: "2023-11-21T00:00:00.000Z", 
        };

        const res = await supertest(app)
            .post('/api/expenses')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .send( expensesData)
            .expect(201); 
            expect(res.body).toHaveProperty('amount', expensesData.amount);
            expect(res.body).toHaveProperty('description', expensesData.description);
            expect(res.body).toHaveProperty('user'); 
            expect(res.body.user).toEqual(expect.any(String)); 

            expence_id = res.body._id;
            console.log(expence_id);
        });

        it('should create a new expense with correct information and geolocation data', async () => {
          const expensesData = {
              amount: 240,
              description: "nouvelle dépense",
              date: "2023-11-21T00:00:00.000Z",
              location: {
                  type: 'Point',
                  coordinates: [-73.935242, 40.730610] // Longitude et latitude exemple
              }
          };
      
          const res = await supertest(app)
              .post('/api/expenses')
              .set('Content-Type', 'application/json')
              .set('Authorization', `Bearer ${token}`)
              .send(expensesData)
              .expect(201);
      
          expect(res.body).toHaveProperty('amount', expensesData.amount);
          expect(res.body).toHaveProperty('description', expensesData.description);
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toEqual(expect.any(String));
          expect(res.body).toHaveProperty('location');
          expect(res.body.location).toHaveProperty('type', 'Point');
          expect(res.body.location).toHaveProperty('coordinates');
          expect(res.body.location.coordinates).toEqual(expect.arrayContaining(expensesData.location.coordinates));
      
          console.log(res.body._id);
      });
      
        it('envoyé des données incomplete pour créer une dépense', async () => {
            const incompleteData = { description: 'New Expense', date: new Date() }; // Montant manquant
          
            const res = await supertest(app)
              .post('/api/expenses')
              .set('Authorization', `Bearer ${token}`)
              .send(incompleteData)
              .expect(400);
          
            expect(res.body).toEqual({ message: "Les informations fournies sont incomplètes." });
          });

          it('should handle internal server error when creating an expense', async () => {
            // Setup: Spy on the Expense.save method and mock its implementation to throw an error
            const saveSpy = jest.spyOn(Expense.prototype, 'save');
            saveSpy.mockRejectedValueOnce(new Error('Internal Server Error'));
        
            const expensesData = {
              amount: 240,
              description: 'nouvelle depense',
              date: '2023-11-21T00:00:00.000Z',
              // Include additional fields required by your Expense model
            };
                
            // Act: Make a POST request to create a new expense
            const res = await supertest(app)
              .post('/api/expenses')
              .set('Content-Type', 'application/json')
              .set('Authorization', `Bearer ${token}`)
              .send(expensesData)
              .expect(StatusCodes.INTERNAL_SERVER_ERROR); // Expect an internal server error response
        
            // Assert: Check the response body for the correct error message
            expect(res.body).toHaveProperty('message', 'Internal Server Error');
        
            // Restore the original implementation
            saveSpy.mockRestore();
          });
        
     
        it('Trouver les dépenses dutilisateur spécifique', async () => {
       
            const res = await supertest(app)
                .get('/api/expenses') 
                 .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .expect(200); 
        
            expect(Array.isArray(res.body)).toBeTruthy();
        
            res.body.forEach(expense => {
                expect(expense).toHaveProperty('amount');
                expect(expense).toHaveProperty('description');
                expect(expense).toHaveProperty('user');
                expect(expense.user).toEqual(user._id.toString());
            });

        
        });

        it('Retrouver une dépense spécifique', async () => {
        
            const res = await supertest(app)
                .get(`/api/expenses/${expence_id}`) // Utilisez la méthode GET avec l'ID du budget
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`) // Assurez-vous d'utiliser le bon token
                .expect(200); // S'attendre à un succès
        
            const expense = res.body;
            expect(expense).toHaveProperty('_id');
            expect(expense).toHaveProperty('amount');
            expect(expense).toHaveProperty('description');
            expect(expense).toHaveProperty('user');
            expect(expense.user).toEqual(user._id.toString()); // Assurez-vous que l'utilisateur correspond
        
            // Vous pouvez également ajouter des vérifications supplémentaires si nécessaire
        });

        it('retourner une erreur 404 si le budget envoyé nexiste pas', async () => {
            const res = await supertest(app)
              .get('/api/expenses/by-budget/nonexistentbudget') // Utilisez un nom de budget inexistant
              .set('Authorization', `Bearer ${token}`)
              .expect(404);
          
            expect(res.body).toEqual({ message: 'No budget found with this name.' });
          });

     // Fonctionne
     it('crée un budget pour lexpense', async () => {
        const budgetData = {
            allocatedAmount: 1000,
            category: "Nourriture",
            id: user._id
        };

        const res = await supertest(app)
            .post('/api/budgets')
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .send( budgetData)
            .expect(201); 
            expect(res.body).toHaveProperty('allocatedAmount', budgetData.allocatedAmount);
            expect(res.body).toHaveProperty('category', budgetData.category);
            expect(res.body).toHaveProperty('user'); 
            expect(res.body.user).toEqual(expect.any(String)); 

            budget_id = res.body._id;
        });



        it('Updater une dépense spécific', async () => {

            const updatedData = {
                amount : 240, 
                description : "nouvealles depenses", 
                date: "2023-11-21T00:00:00.000Z",
                budgetId : budget_id
              };
                
    
            const res = await supertest(app)
                .put(`/api/expenses/${expence_id}`) 
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`) 
                .send(updatedData)
                .expect(200); 

                const expense = res.body;
                console.log(expense);
                expect(expense).toHaveProperty('_id');
                expect(expense).toHaveProperty('amount');
                expect(expense).toHaveProperty('description');
                expect(expense).toHaveProperty('user');

    });

    it('Updater une dépense spécific', async () => {

      const updatedData = null

      const res = await supertest(app)
          .put(`/api/expenses/${expence_id}`) 
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`) 
          .send(updatedData)
          .expect(500); 

});




    it('should return 404 if the expense to update is not found', async () => {
        const fakeId = '123456789012345678901234'; // Un ID MongoDB fictif
        const updateData = { amount: 100, 
            description: 'Updated', 
            date: new Date(),
            budgetId : fakeId };
      
        const res = await supertest(app)
          .put(`/api/expenses/${fakeId}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(404);
      
        expect(res.body).toEqual({ message: 'Dépense non trouvée' });
      });
      

    it('should return 401 if the request is unauthorized', async () => {
        const expensesData = {
            amount : 240, 
            description : "nouvealle depense", 
            date: "2023-11-21T00:00:00.000Z", 
        };
        const res = await supertest(app)
        .post('/api/expenses')
        .set('Content-Type', 'application/json')
        .send( expensesData)
        .expect(401);
      
        expect(res.body).toEqual({ error: 'Accès refusé, en-tête d\'autorisation manquant.' });
      });
      

    it('retourne les dépense lié à une dépense spécifique', async () => {
        // Assurez-vous d'avoir un budget et des dépenses existants pour ce test
        const budgetName = 'Nourriture'; // Remplacez par un nom de budget existant
      
        const res = await supertest(app)
          .get(`/api/expenses/by-budget/${budgetName}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      
        // Vérifiez que la réponse contient un tableau de dépenses
        expect(Array.isArray(res.body)).toBeTruthy();
        res.body.forEach(expense => {
          expect(expense).toHaveProperty('amount');
        });
        });
      

    it('Filtrer les dépense par date et nom', async () => {
        // Préparez les données de test (à adapter en fonction de votre base de données de test)
        const testCategory = "Nourriture";
        const testDate = "2023-11-21";
    
        const res = await supertest(app)
            .get(`/api/expenses/filtrer/par?category=${testCategory}&date=${testDate}`) 
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`)
            .expect(200); // S'attendre à un succès
    
        // Vérifiez que la réponse est un tableau
        expect(Array.isArray(res.body)).toBeTruthy();
        // Vérifiez que chaque dépense dans la réponse correspond aux critères de filtrage
        res.body.forEach(expense => {
            expect(expense.budget).toHaveProperty('category', testCategory);
            // Convertissez les dates en format standard pour la comparaison
            const expenseDate = new Date(expense.date).toISOString().split('T')[0];
            expect(expenseDate).toEqual(testDate);
        });
    });
    
    


   
    it('effacer une dépense spécifique', async () => {       

        const res = await supertest(app)
            .delete(`/api/expenses/${expence_id}`) 
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);

            const deletedBudget = await Budget.findById(expence_id);
            expect(deletedBudget).toBeNull();


    });


    it('should return 404 if the expense to delete is not found', async () => {
        const fakeId = '123456789012345678901234'; // Un ID MongoDB fictif
      
        const res = await supertest(app)
          .delete(`/api/expenses/${fakeId}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(404);
      
        expect(res.body).toEqual({ message: 'Dépense non trouvée' });
      });

    afterAll(async () => {
      //  Nettoyer: Supprimer l'utilisateur test et déconnecter la base de données
        await User.deleteOne({ _id: user._id });
        //supprimer le budget test
        await Expense.deleteOne({ _id: expence_id });
        // await Budget.deleteOne({ _id: budget_id });

        await mongoose.disconnect();
    });
});
