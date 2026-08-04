const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookland',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err.message);
});

const query = (text, params) => pool.query(text, params);

const closePool = () => pool.end();

module.exports = {
  query,
  pool,
  closePool,
};
