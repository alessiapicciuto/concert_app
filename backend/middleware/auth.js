const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Accesso negato. Token mancante." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Salva i dati dell'utente nella richiesta
    next();
  } catch (error) {
    res.status(403).json({ message: "Token non valido o scaduto." });
  }
};

module.exports = verifyToken;