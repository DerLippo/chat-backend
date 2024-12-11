import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.headers.cookie
    ?.split('token=')[1]
    ?.split(';')[0];

  if (!token) {
    const err = new Error('Authentication error');
    return next(err);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const error = new Error('Authentication error');
      return next(error);
    }

    socket.userId = decoded.userId;
    next();
  });
};
