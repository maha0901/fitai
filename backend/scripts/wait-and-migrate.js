require('dotenv').config();
const { pool } = require('../src/config/db');
const fs = require('fs');
const path = require('path');

const maxAttempts = 30;
const delay = 1000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDb() {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (err) {
      console.log(`Waiting for PostgreSQL... (${i + 1}/${maxAttempts})`);
      await sleep(delay);
    }
  }
  throw new Error('PostgreSQL not available');
}

async function migrate() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, '../src/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    const addProfilePath = path.join(__dirname, '../src/db/schema-add-profile.sql');
    if (fs.existsSync(addProfilePath)) {
      await client.query(fs.readFileSync(addProfilePath, 'utf8'));
    }
    const addLogsPath = path.join(__dirname, '../src/db/schema-add-logs.sql');
    if (fs.existsSync(addLogsPath)) {
      await client.query(fs.readFileSync(addLogsPath, 'utf8'));
    }
    const addKzPath = path.join(__dirname, '../src/db/schema-add-kz.sql');
    if (fs.existsSync(addKzPath)) {
      await client.query(fs.readFileSync(addKzPath, 'utf8'));
    }
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

waitForDb()
  .then(() => migrate())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
