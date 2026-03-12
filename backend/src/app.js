const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

require('express-async-errors');

const { notFoundHandler } = require('./middleware/notFoundHandler');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware, requireAuth } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const membersRoutes = require('./routes/membersRoutes');
const donationsRoutes = require('./routes/donationsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityLogsRoutes = require('./routes/activityLogsRoutes');
const pendingRoutes = require('./routes/pendingRoutes');
const receiptsRoutes = require('./routes/receiptsRoutes');
const adminRoutes = require('./routes/adminRoutes');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use(authMiddleware);

  app.use('/api/auth', authRoutes);

  app.use('/api', requireAuth);

  app.use('/api/members', membersRoutes);
  app.use('/api/donations', donationsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/activity-logs', activityLogsRoutes);
  app.use('/api/pending', pendingRoutes);
  app.use('/api/receipts', receiptsRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
