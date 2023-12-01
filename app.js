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
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import { MongoClient, ServerApiVersion } from 'mongodb';


dotenv.config();  // Charger les variables d'environnement
const uri = process.env.MONGODBAtlas_URI;

const app = express();

app.use(express.json());  // Middleware pour lire le corps JSON


// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync('./openapi.yml'));
// Serve the Swagger UI documentation.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/apidoc', express.static(path.join(__dirname, 'docs')));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Pour servir la page d'inscription sur la route /register
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


// let dbUri;

// if (process.env.NODE_ENV === 'test') {
//   dbUri = process.env.TEST_MONGODB_URI;
// } else {
//   dbUri = process.env.MONGODB_URI;
// }

// await mongoose.connect(dbUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => {
//   console.log('MongoDB Connected');
// }).catch(err => {
// console.error('Failed to connect to MongoDB', err);
// process.exit(1);
// });


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Middleware pour la gestion des erreurs
app.use(notFound);
app.use(errorHandler);


export default app;
