import express from 'express';

const router = express.Router();

router.post('/logout', (req, res) => {
  res
    .clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain:
        process.env.NODE_ENV === 'production'
          ? `.${process.env.COOKIE_DOMAIN}` // "." = alle subdomains
          : process.env.COOKIE_DOMAIN_DEV,
    })
    .status(200)
    .json({ message: 'Logout erfolgreich' });
});

export default router;
