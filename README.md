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

La documentation détaillée de l'API Smart Savings est disponible à l'URL suivante : https://smart-saving.onrender.com/apidoc/

## RealTime Ending

Notre API utilise les WebSockets pour fournir des fonctionnalités de messagerie en temps réel. Cela permet aux utilisateurs de notre API de recevoir des mises à jour immédiates et des notifications, améliorant ainsi l'interactivité et l'efficacité de l'application.
Établissement de la Connexion WebSocket

Initiez une connexion WebSocket en utilisant l'adresse ci-dessous : ws://smart-saving.onrender.com

Caractéristiques du WebSocket :

La connexion WebSocket est établie via notre serveur WebSocket (WebSocketServer), qui est lié au serveur HTTP. Lors de l'établissement de la connexion, le client doit fournir un token JWT valide pour authentifier la session. Si le token est absent ou invalide, la connexion est refusée et fermée.
Gestion des Clients et Messages

    Gestion des Clients : Chaque client WebSocket connecté est identifié par un userId unique, extrait du token JWT. Ce mécanisme permet de gérer efficacement les sessions utilisateurs et d'envoyer des messages ciblés.
    Réception et Traitement des Messages : Lorsqu'un message est reçu d'un client, il est analysé et traité. Si le message n'est pas au format JSON valide, il est ignoré.

Envoyer des Messages :

    Diffusion à Tous les Clients : La fonction broadcastMessage permet d'envoyer un message à tous les clients connectés. Cette fonction est utile pour des notifications globales ou des mises à jour.
    Envoyer à un Client Spécifique : La fonction sendMessageToClient permet d'envoyer un message à un client spécifique en utilisant son userId. Cela est particulièrement utile pour des notifications ou des mises à jour personnalisées.

Exemple d'Utilisation : Création de Budget

Voici un exemple de la façon dont les WebSockets sont utilisés pour des notifications en temps réel :

    Création d'un Budget : Lorsqu'un utilisateur crée un nouveau budget via la fonction createBudget, un message est envoyé en temps réel à l'utilisateur concerné. Ce message contient les détails du budget créé, signalant ainsi à l'utilisateur que son action a été traitée et enregistrée.
    Notification : Le message envoyé suit le format { event: 'budgetCreated', budget: savedBudget }, informant l'utilisateur de l'événement (création de budget) ainsi que des détails du budget créé.

Cette fonctionnalité de messagerie en temps réel améliore l'expérience utilisateur en fournissant des feedbacks immédiats et des mises à jour pertinentes, rendant l'interaction avec l'API plus dynamique et réactive.

## Auteurs

Raey assefa, Athiyya Siswanto, Cloe Gex
