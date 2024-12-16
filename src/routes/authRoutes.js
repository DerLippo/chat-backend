import express from 'express';
import { registerUser, loginUser } from '../services/userService.js';
import {
  validateRegistrationInput,
  validateLoginInput,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRegistrationInput, async (req, res) => {
  try {
    const { username, password, email } = req.body;
    await registerUser(username, email, password);

    res.status(201).json({ message: 'Registrierung erfolgreich!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, name } = await loginUser(username, password);

    // Token als HttpOnly-Cookie setzen
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain:
          process.env.NODE_ENV === 'production'
            ? `.${process.env.COOKIE_DOMAIN}` // "." = alle subdomains
            : process.env.COOKIE_DOMAIN_DEV,
        maxAge: 24 * 60 * 60 * 1000, // 24 Stunden Gültigkeit
      })
      .status(200)
      .json({ message: 'Login erfolgreich.', name: name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
