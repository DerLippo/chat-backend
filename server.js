import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import refreshTokenRouter from './src/routes/refreshTokenRoute.js';
import logoutRoute from './src/routes/logoutRoute.js';
import roomRoutes from './src/routes/roomRoutes.js';
import { apiLimiter } from './src/middleware/rateLimitMiddleware.js';
import { socketRoomMiddleware } from './src/middleware/socketRoomMiddleware.js';
import { socketAuthMiddleware } from './src/middleware/socketAuthMiddleware.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'development'
        ? process.env.CLIENT_URI_DEV
        : process.env.CLIENT_URI,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Aktiviere 'trust proxy', um korrekt hinter einem Proxy (z. B. Apache oder einem Load Balancer) zu arbeiten.
app.set('trust proxy', true);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'development'
        ? process.env.CLIENT_URI_DEV
        : process.env.CLIENT_URI,
    credentials: true,
  })
);
app.use(apiLimiter); // Rate Limiting für alle Routen aktivieren
app.use(express.json());
app.use(cookieParser());

app.use(refreshTokenRouter);
app.use(roomRoutes);
app.use(authRoutes); // Login Register
app.use(logoutRoute); // Logout

/* Database Connection */
mongoose.connect(
  process.env.NODE_ENV === 'development'
    ? process.env.MONGODB_URI_DEV
    : process.env.MONGODB_URI
);

/* Socket */
io.use(socketAuthMiddleware); // Socket Authentication Middleware
const userSockets = new Map();
socketRoomMiddleware(io, userSockets);

/* Server Start */
const port =
  process.env.NODE_ENV === 'production'
    ? process.env.SERVER_PORT
    : process.env.SERVER_PORT_DEV;

server.listen(port, () => {
  console.log(`Server is running at Port: ${port}`);
  console.log(`Running in ->${process.env.NODE_ENV}<- mode`);
});
