const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedInitialUsers } = require('../src/services/seedUsersService');

let mongo;

async function connect() {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

  process.env.EDITOR_USERNAME = process.env.EDITOR_USERNAME || 'editor';
  process.env.EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || 'editor_pass';
  process.env.EDITOR_NAME = process.env.EDITOR_NAME || 'Editor';

  process.env.VIEWER_USERNAME = process.env.VIEWER_USERNAME || 'viewer';
  process.env.VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || 'viewer_pass';
  process.env.VIEWER_NAME = process.env.VIEWER_NAME || 'Viewer';

  await seedInitialUsers();
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}

async function clearDatabase() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

module.exports = { connect, closeDatabase, clearDatabase };
