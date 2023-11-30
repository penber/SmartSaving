import supertest from "supertest";
import app from "../app.js"; 
import mongoose from 'mongoose';


describe('Middleswares', function () {
 
    

      it('Test des middleware sur une page inexistante', async () => {
        const res = await supertest(app)
          .get('/route-qui-nexiste-pas')
          .expect(404);
      
        expect(res.text).toEqual('Page non trouvée');
      });
      
      
      it('should reject request with malformed authorization header', async () => {
        const res = await supertest(app)
          .get('/api/expenses') // Remplacez par une route de test valide protégée par verifyToken
          .set('Authorization', 'WrongFormatToken')
          .expect(401);
      
        expect(res.body).toEqual({
          error: 'Accès refusé, en-tête d\'autorisation mal formé.'
        });
      });

      it('should reject request with invalid JWT token', async () => {
        const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE2MTg4NTQyNTAsImV4cCI6MTYxODg1NDI1MX0.xxxxxxx';
      
        const res = await supertest(app)
          .get('/api/expenses') // Remplacez par une route de test valide protégée par verifyToken
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401);
      
        expect(res.body).toEqual({
          error: 'Token invalide' + invalidToken
        });
      });
      
      
    afterAll(async () => {
        await mongoose.disconnect();
    });
});
