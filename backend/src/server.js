require('dotenv').config();
require('express-async-errors');

const { createApp } = require('./app');
const { connectDb } = require('./config/db');
const { seedInitialUsers } = require('./services/seedUsersService');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDb(process.env.MONGODB_URI);
  await seedInitialUsers();
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`MandirLedger backend listening on port ${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
