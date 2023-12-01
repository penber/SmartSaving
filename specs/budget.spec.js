import supertest from "supertest";
import app from "../app.js"; // Assurez-vous que le chemin est correct
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import User from '../models/User.js'; // Assurez-vous d'importer User
import { jest } from '@jest/globals';

let budget_id;
let token;
let user;

describe('POST /api/budgets', function () {
    // Créer un utilisateur et obtenir un token avant de tester la création de budget
    beforeAll(async () => {
        //vérifier que l'utilisateur n'existe pas déjà
        const userExists = await User.findOne({ email: 'test@gmail.com' });
        if (userExists) {
            await User.deleteOne({ email: 'test@gmail.com' });
        }
        // Enregistrer un utilisateur et obtenir un token
        const userRes = await supertest(app)
        .post('/api/users/register') // Assurez-vous que c'est le bon chemin
        .send({
          username: 'testuser',
            email: 'test@gmail.com',
            password: 'testpassword',
        });
    
        expect(userRes.statusCode).toEqual(201);
        expect(userRes.body).toHaveProperty('token');
        token = userRes.body.token;

        // Récupérer l'utilisateur créé
        user = await User.findOne({ email: 'test@gmail.com' });
         });

    // Fonctionne
    it('should create a new budget with correct information', async () => {
        const budgetData = {allocatedAmount: 1000,category: "Nourriture",id: user._id
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

        it('retourne une erreur 400 vu que les données ne sont pas complète', async () => {
            const incompleteData = { allocatedAmount: 1000 }; // Catégorie manquante
          
            const res = await supertest(app)
              .post('/api/budgets')
              .set('Authorization', `Bearer ${token}`)
              .send(incompleteData)
              .expect(400);
          
            expect(res.body).toEqual({ message: "Budget validation failed: category: Path `category` is required." });
          });


        //fonctionne
        it('Trouver les budget dutilisateur spécifique', async () => {
       
            const res = await supertest(app)
                .get('/api/budgets') 
                 .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .expect(200); 
        
            expect(Array.isArray(res.body)).toBeTruthy();
        
            res.body.forEach(budget => {
                expect(budget).toHaveProperty('allocatedAmount');
                expect(budget).toHaveProperty('category');
                expect(budget).toHaveProperty('user');
                expect(budget.user).toEqual(user._id.toString());
            });
        });
        
        // retouver par id ne fonctione pas
        it('retrouver un budget spécifique par id', async () => {
            // Assurez-vous que budget_id contient l'ID d'un budget existant pour l'utilisateur testé
        
            const res = await supertest(app)
                .get(`/api/budgets/${budget_id}`) // Utilisez la méthode GET avec l'ID du budget
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${token}`) // Assurez-vous d'utiliser le bon token
                .expect(200); // S'attendre à un succès
        
            // Vérifier que la réponse a la structure attendue d'un budget
            expect(res.body).toHaveProperty('_id', budget_id);
            expect(res.body).toHaveProperty('allocatedAmount');
            expect(res.body).toHaveProperty('category');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toEqual(user._id.toString()); // Assurez-vous que l'utilisateur correspond
        
            // Vous pouvez également ajouter des vérifications supplémentaires si nécessaire
        });
        
        it('retourner une erreur 404 si il ny a pas de budget', async () => {
            // Utiliser un ID fictif ou un ID qui n'appartient pas à l'utilisateur
            const fakeBudgetId = new mongoose.Types.ObjectId();
          
            const res = await supertest(app)
              .get(`/api/budgets/${fakeBudgetId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(404);
          
            expect(res.body).toEqual({ message: 'Budget non trouvé' });
          });

          it('revoir une erreur 400 si le budget est incorrect', async () => {
            const invalidBudgetId = 'invalid-id';
          
            const res = await supertest(app)
              .get(`/api/budgets/${invalidBudgetId}`)
              .set('Authorization', `Bearer ${token}`)
              .expect(400);
          
            expect(res.body).toHaveProperty('message');
          });
          
          
        //updater un budget : 
        
        it('should update a specific budget', async () => {
      
        const updatedData = {
            allocatedAmount: 1000,
            category: "Nourriture"
          };


        const res = await supertest(app)
            .put(`/api/budgets/${ budget_id}`) 
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`) 
            .send(updatedData)
            .expect(200); 

        // Vérifier la réponse 
        expect(res.body).toHaveProperty('_id', budget_id);
        expect(res.body).toHaveProperty('allocatedAmount', updatedData.allocatedAmount);
        expect(res.body).toHaveProperty('category', updatedData.category);

});

it('retourne une erreur 404 si le budget à créer éxiste pas', async () => {
    // Utiliser un ID fictif ou un ID qui n'appartient pas à l'utilisateur
    const fakeBudgetId = new mongoose.Types.ObjectId();
  
    const res = await supertest(app)
      .put(`/api/budgets/${fakeBudgetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ allocatedAmount: 500, category: "Transport" })
      .expect(404);
  
    expect(res.body).toEqual({ message: 'Budget non trouvé' });
  });
  
  it('retourne une erreur 404 si les données ne sont pas corrects', async () => {
    const invalidData = {}; // Données invalides, par exemple sans allocatedAmount ou category
  
    const res = await supertest(app)
      .put(`/api/budgets/${budget_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(invalidData)
      .expect(400);
  
    expect(res.body).toHaveProperty('message');
  });
  

it('should delete a specific budget', async () => {   

    const res = await supertest(app)
        .delete(`/api/budgets/${budget_id}`) 
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`) 
        .expect(200); 

    // Vérifier que la réponse confirme la suppression du budget
    expect(res.body).toEqual({ message: 'Budget supprimé' });

    // Vérifier que le budget n'existe plus
    const deletedBudget = await Budget.findById(budget_id);
    expect(deletedBudget).toBeNull();

});

it('should return 404 if the specified budget is not found', async () => {
    // Utiliser un ID fictif ou un ID qui n'appartient pas à l'utilisateur
    const fakeBudgetId = new mongoose.Types.ObjectId();
  
    const res = await supertest(app)
      .delete(`/api/budgets/${fakeBudgetId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  
    expect(res.body).toEqual({ message: 'Budget non trouvé' });
  });
  


    afterAll(async () => {
        await User.deleteOne({ _id: user._id });
        await Budget.deleteOne({ _id: budget_id });
        await mongoose.disconnect();
    });
});

export {budget_id}