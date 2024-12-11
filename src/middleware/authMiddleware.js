import jwt from 'jsonwebtoken';
import { sanitizeString } from '../utils/sanitizeString.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token; // Optional Chaining für zusätzliche Sicherheit

  if (!token) {
    return res.status(403).json({ error: 'Kein Token bereitgestellt!' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: 'Ungültiger oder abgelaufener Token!' });
    }

    req.userId = decoded.userId;
    next();
  });
};

export const validateRegistrationInput = (req, res, next) => {
  // Bereinige Strings
  req.body = {
    username: sanitizeString(req.body.username || ''),
    password: sanitizeString(req.body.password || ''),
    email: sanitizeString(req.body.email || ''),
  };

  const { username, password, email } = req.body;

  // Sind alle Felder ausgefüllt?
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ error: 'Alle Felder müssen ausgefüllt sein!' });
  }

  // Hat der Nutzername die korrekte Länge?
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      error: 'Der Nutzername muss zwischen 3 und 20 Zeichen lang sein!',
    });
  }

  // Hat das Passwort die korrekte Länge?
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: 'Das Passwort muss mindestens 8 Zeichen lang sein!' });
  }

  // Hat die E-Mail das korrekte Format?
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: 'Bitte eine gültige E-Mail-Adresse eingeben!' });
  }

  // Alles gültig -> Weiter zur Route
  next();
};

export const validateLoginInput = (req, res, next) => {
  // Bereinige Strings
  req.body = {
    username: sanitizeString(req.body.username || ''),
    password: sanitizeString(req.body.password || ''),
  };

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: 'Benutzername und Passwort darf nicht leer sein!' });
  }

  next();
};
