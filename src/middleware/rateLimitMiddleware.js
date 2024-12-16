import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 1000, // Maximal 100 Anfragen pro 15 Minuten
  message: {
    error: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.',
  },
  standardHeaders: true, // Header `RateLimit-*` im Antwortkopf aktivieren
  legacyHeaders: false, // Deaktiviert `X-RateLimit-*` Header
});
