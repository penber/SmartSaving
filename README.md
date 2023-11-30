# Projet API - Smart Savings
## Explication du Projet

Smart Savings est une API développée pour faciliter la gestion des finances personnelles. Elle permet aux utilisateurs de créer et suivre leurs budgets, ainsi que d'enregistrer et analyser leurs dépenses. Cette API est conçue pour offrir une expérience utilisateur simplifiée et efficace, aidant les utilisateurs à mieux gérer leurs finances personnelles.

## MongoDB

En raison de certaines irrégularités rencontrées dans la version 7 de MongoDB, notre choix s'est porté sur la version 6, qui s'est avérée plus stable pour nos fonctionnalités."

## Instructions d'Installation

Pour installer et exécuter l'API Smart Savings sur votre machine locale, suivez ces étapes :

    Cloner le dépôt :

    bash

git clone [URL_DU_DEPOT]

Remplacez [URL_DU_DEPOT] par l'URL du dépôt Git de Smart Savings.

Installer les dépendances :

    bash : cd chemin/vers/smart-savings
           npm install

    Configurer l'environnement :
    Créez un fichier .env à la racine du projet avec les variables d'environnement nécessaires.

Lancer le Serveur

Exécutez le serveur avec la commande suivante :

    bash : npm start

Le serveur sera accessible à l'adresse http://localhost:PORT, où PORT est le port configuré dans votre fichier .env.

## Structure de Données

La structure de données comprend des modèles pour les utilisateurs, les budgets et les dépenses. Chaque modèle contient des champs spécifiques pour stocker les informations pertinentes. Voici la structure de nos modèles :

### User :

    _id: ObjectId (Géré automatiquement par MongoDB),

    email: String (adresse email de l'utilisateur),

    password: String (mot de passe de l'utilisateur),

    timestamps: Object (contient les dates de création et de mise à jour, gérées automatiquement par MongoDB)

 ### Budget :

    _id: ObjectId (Géré automatiquement par MongoDB),

    user: ObjectId (l'ID de l'utilisateur qui crée le budget),

    allocatedAmount: Number (montant alloué au budget),

    category: String (catégorie du budget),

    timestamps: Object (contient les dates de création et de mise à jour, gérées automatiquement par MongoDB)


### Expense :

    _id: ObjectId (Géré automatiquement par MongoDB),

    amount: Number (montant de la dépense),

    description: String (description de la dépense),

    date: Date (date de la dépense),

    budget: ObjectId (référence à l'objet MongoDB du modèle Budget lié à la dépense),

    timestamps: Object (contient les dates de création et de mise à jour, gérées automatiquement par MongoDB)


## Documentation

La documentation détaillée de l'API Smart Savings est disponible à l'URL fournie par le projet.

## RealTime Ending

Smart Savings utilise socket.io pour fournir des mises à jour en temps réel, comme les notifications de dépenses ou de changements de budget.

## Auteurs

Listez les auteurs et contributeurs du projet Smart Savings.
