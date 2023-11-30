import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/UsersRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();  // Charger les variables d'environnement

const app = express();

app.use(express.json());  // Middleware pour lire le corps JSON



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Pour servir la page d'inscription sur la route /register
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


let dbUri;

if (process.env.NODE_ENV === 'test') {
  dbUri = process.env.TEST_MONGODB_URI;
} else {
  dbUri = process.env.MONGODB_URI;
}

await mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
console.error('Failed to connect to MongoDB', err);
process.exit(1);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Middleware pour la gestion des erreurs
app.use(notFound);
app.use(errorHandler);


export default app;
