import express from 'express';

const router = express.Router();

router.post('/logout', (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    })
    .status(200)
    .json({ message: 'Logout erfolgreich' });
});

export default router;
