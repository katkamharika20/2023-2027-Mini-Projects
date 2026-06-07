require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const expressLayouts = require('express-ejs-layouts');

const connectDB = require('./config/db');
const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// 🔥 DATABASE CONNECTION
// =======================
connectDB();

// =======================
// 🔥 MIDDLEWARE
// =======================
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// =======================
// 🔥 SESSION
// =======================
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/police-dashboard"
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// =======================
// 🔥 VIEW ENGINE
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Attach user globally
app.use(attachUser);

// =======================
// 🔥 ROUTES
// =======================
app.use('/', require('./routes/auth'));

app.get('/', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.redirect('/alerts');
});

app.use('/alerts', require('./routes/alerts'));
app.use('/map', require('./routes/map'));
app.use('/guidelines', require('./routes/guidelines'));

// =======================
// 🔥 404
// =======================
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// =======================
// 🔥 SOCKET.IO SETUP
// =======================
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

// =======================
// 🔥 START SERVER (ONLY ONCE)
// =======================
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});