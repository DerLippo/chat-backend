import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/refresh-token', verifyToken, (req, res) => {
  const { userId } = req; // userId kommt von der verifyToken-Middleware

  // Neuen Token generieren
  const newToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

  // Token als HttpOnly-Cookie setzen
  res
    .cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Sicheres Cookie nur im Produktionsmodus
      sameSite: 'strict', // Schutz vor Cross-Site-Angriffen
      maxAge: 60 * 60 * 1000, // 1 Stunde Gültigkeit
    })
    .status(200)
    .json({ message: 'Token erfolgreich erneuert' });
});

export default router;
