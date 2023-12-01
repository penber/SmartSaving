  import jwt from 'jsonwebtoken';
  import dotenv from 'dotenv';

  dotenv.config();

  const SECRET_KEY = process.env.JWT_SECRET || 'mySuperSecret';

  export const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      res.status(401).json({ error: 'Accès refusé, en-tête d\'autorisation manquant.' });
      return;
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Accès refusé, en-tête d\'autorisation mal formé.' });
      return;
    }

    const token = tokenParts[1];

    try {
      const verified = jwt.verify(token, SECRET_KEY);
      req.userId = verified.id;
      next();
    } catch (error) {
      console.error('Échec de la vérification du JWT:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Token invalide'+ token });
      } else {
        res.status(400).json({ error: 'Échec de la vérification du token' });
      }
    }
  };


  export const checkAuthorization = (req, res, next) => {
    // Ici, vous pouvez vérifier les autorisations de l'utilisateur
    // Par exemple, vous pourriez vérifier le rôle de l'utilisateur
    next();
  };
